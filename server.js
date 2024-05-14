const Hapi = require('@hapi/hapi')
const uuid = require('uuid')
const Joi = require('joi')

const notes = [];

const init = async () => {
    const server = Hapi.server({
        port: 5000,
        host: 'localhost',
    })

    server.route([
        {
            method: 'GET',
            path: '/notes',
            handler: (request, h) => {
                if (notes.length === 0) {
                    return h.response({
                        status: 'success',
                        data: {
                            notes: []
                        }
                    }).code(200);
                } else {
                    return h.response({
                        status: 'success',
                        data: {
                            notes: notes
                        }
                    }).code(200);
                }
            },
        },
        {
            method: 'POST',
            path: '/notes',
            handler: (request, h) => {
                try {
                    const { title, body, tags } = request.payload;
                    const id = uuid.v4();
                    const createdAt = new Date().toISOString();
                    const updatedAt = createdAt;
                    const note = { id, title, createdAt, updatedAt, body, tags };
                    notes.push(note);
                    const response = h.response({
                        status: 'success',
                        message: 'Catatan berhasil ditambahkan',
                        data: {
                            noteId: id
                        }
                    }).code(201);
                    response.header('Location', `/api/notes/${id}`);
                    return response;
                } catch (error) {
                    return h.response({
                        status: 'error',
                        message: 'Catatan gagal ditambahkan'
                    }).code(500);
                }
            },
            options: {
                validate: {
                    payload: Joi.object({
                        title: Joi.string().required(),
                        body: Joi.string().required(),
                        tags: Joi.array().items(Joi.string()),
                    })
                }
            }
        },
        {
            method: 'GET',
            path: '/notes/{id}',
            handler: (request, h) => {
                const { id } = request.params;
                const note = notes.find(note => note.id === id);
                if (note) {
                    return h.response({
                        status: 'success',
                        data: {
                            note: note
                        }
                    }).code(200);
                } else {
                    return h.response({
                        status: 'fail',
                        message: 'Catatan tidak ditemukan'
                    }).code(404);
                }
            }
        },
        {
            method: 'PUT',
            path: '/notes/{id}',
            handler: (request, h) => {
                const { id } = request.params;
                const { title, body, tags } = request.payload;
        
                const index = notes.findIndex(note => note.id === id);
        
                if (index !== -1) {
                    notes[index] = {
                        ...notes[index],
                        title: title,
                        body: body,
                        tags: tags,
                        updatedAt: new Date().toISOString()
                    };
                    return h.response({
                        status: 'success',
                        message: 'Catatan berhasil diperbaharui'
                    }).code(200);
                } else {
                    return h.response({
                        status: 'fail',
                        message: 'Gagal memperbarui catatan. Id catatan tidak ditemukan'
                    }).code(404);
                }
            },
            options: {
                validate: {
                    payload: Joi.object({
                        title: Joi.string().required(),
                        body: Joi.string().required(),
                        tags: Joi.array().items(Joi.string())
                    })
                }
            }
        }
    ]);

    await server.start()
    console.log(`Server berjalan pada ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();