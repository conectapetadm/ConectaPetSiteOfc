const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
const crypto = require("crypto");
const multer = require("multer");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ======================================================
// UPLOAD DE IMAGEM
// ======================================================

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const tiposPermitidos = [

            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/avif"

        ];


        if (
            tiposPermitidos.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Formato de imagem não permitido. Use JPG, PNG, GIF, WebP ou AVIF."
                )
            );

        }

    }

});


// ======================================================
// GOOGLE SHEETS
// ======================================================

const auth = new google.auth.GoogleAuth({

    credentials: JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ),

    scopes: [
        "https://www.googleapis.com/auth/spreadsheets"
    ]

});


const sheets = google.sheets({

    version: "v4",

    auth

});


// ======================================================
// AUTENTICAÇÃO DO ADMIN
// ======================================================

function criarTokenAdmin() {

    const dados = {

        tipo: "admin",

        expira:
            Date.now() +
            (8 * 60 * 60 * 1000)

    };


    const payload =
        Buffer
            .from(
                JSON.stringify(dados)
            )
            .toString(
                "base64url"
            );


    const assinatura =
        crypto
            .createHmac(
                "sha256",
                process.env.ADMIN_SESSION_SECRET
            )
            .update(payload)
            .digest("base64url");


    return `${payload}.${assinatura}`;

}


// ======================================================
// VERIFICAR TOKEN
// ======================================================

function verificarTokenAdmin(token) {

    try {

        if (!token) {

            return false;

        }


        const partes =
            token.split(".");


        if (
            partes.length !== 2
        ) {

            return false;

        }


        const payload =
            partes[0];


        const assinatura =
            partes[1];


        const assinaturaEsperada =
            crypto
                .createHmac(
                    "sha256",
                    process.env.ADMIN_SESSION_SECRET
                )
                .update(payload)
                .digest("base64url");


        if (
            assinatura !==
            assinaturaEsperada
        ) {

            return false;

        }


        const dados =
            JSON.parse(

                Buffer
                    .from(
                        payload,
                        "base64url"
                    )
                    .toString()

            );


        if (
            dados.tipo !==
            "admin"
        ) {

            return false;

        }


        if (
            Date.now() >
            dados.expira
        ) {

            return false;

        }


        return true;


    } catch (erro) {

        return false;

    }

}


// ======================================================
// PROTEGER ROTAS DO ADMIN
// ======================================================

function protegerAdmin(
    req,
    res,
    next
) {

    const token =
        req.headers.authorization
            ?.replace(
                "Bearer ",
                ""
            );


    if (
        !verificarTokenAdmin(
            token
        )
    ) {

        return res
            .status(401)
            .json({

                erro:
                    "Acesso não autorizado."

            });

    }


    next();

}


// ======================================================
// ENVIAR FOTO PARA O PIXHOST
// ======================================================
//
// O Pixhost recebe a foto e devolve:
//
// show_url = página da imagem
// th_url   = link direto da thumbnail
//
// Salvaremos o th_url no Google Sheets,
// pois ele pode ser usado diretamente no <img>.
//
// ======================================================

async function enviarFotoParaPixhost(
    arquivo
) {

    if (!arquivo) {

        throw new Error(
            "Nenhuma foto foi enviada."
        );

    }


    if (
        arquivo.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "A foto não pode ter mais de 10 MB."
        );

    }


    const formulario =
        new FormData();


    const blob =
        new Blob(
            [
                arquivo.buffer
            ],
            {
                type:
                arquivo.mimetype
            }
        );


    formulario.append(
        "img",
        blob,
        arquivo.originalname
    );


    formulario.append(
        "content_type",
        "0"
    );


    formulario.append(
        "max_th_size",
        "500"
    );


    formulario.append(
        "optimize_for_web",
        "1"
    );


    const resposta =
        await fetch(
            "https://api.pixhost.cc/images",
            {

                method:
                    "POST",

                headers: {

                    "Accept":
                        "application/json"

                },

                body:
                formulario

            }
        );


    const dados =
        await resposta.json();


    if (
        !resposta.ok
    ) {

        console.error(
            "Resposta do Pixhost:",
            dados
        );


        throw new Error(
            "Não foi possível enviar a foto para o Pixhost."
        );

    }


    if (
        !dados.th_url
    ) {

        console.error(
            "Resposta inesperada do Pixhost:",
            dados
        );


        throw new Error(
            "O Pixhost não retornou o link da imagem."
        );

    }


    return {

        showUrl:
            dados.show_url || "",

        fotoUrl:
        dados.th_url

    };

}


// ======================================================
// ROTA PRINCIPAL
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            mensagem:
                "🐾 ConectaPet Backend funcionando!"

        });

    }
);


// ======================================================
// LOGIN DO ADMIN
// ======================================================

app.post(
    "/api/admin/login",
    (req, res) => {

        const {
            senha
        } = req.body;


        if (!senha) {

            return res
                .status(400)
                .json({

                    erro:
                        "Digite a senha."

                });

        }


        if (
            senha !==
            process.env.ADMIN_PASSWORD
        ) {

            return res
                .status(401)
                .json({

                    erro:
                        "Senha incorreta."

                });

        }


        const token =
            criarTokenAdmin();


        res.json({

            sucesso: true,

            token: token

        });

    }
);


// ======================================================
// VERIFICAR LOGIN DO ADMIN
// ======================================================

app.get(
    "/api/admin/me",
    protegerAdmin,
    (req, res) => {

        res.json({

            autenticado: true

        });

    }
);


// ======================================================
// LOGOUT
// ======================================================

app.post(
    "/api/admin/logout",
    protegerAdmin,
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Administrador desconectado."

        });

    }
);


// ======================================================
// ANIMAIS DO SITE PÚBLICO
// ======================================================
//
// Adotado não aparece.
//
// Disponível -> aparece
// Pendente -> aparece
//
// ======================================================

app.get(
    "/api/animais",
    async (req, res) => {

        try {

            const resposta =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhas =
                resposta.data.values || [];


            const animais =
                linhas

                    .filter(
                        linha =>
                            linha.length > 0
                    )

                    .filter(
                        linha => {

                            const animalId =
                                String(
                                    linha[0] || ""
                                ).trim();


                            const status =
                                String(
                                    linha[8] || ""
                                )
                                    .toLowerCase()
                                    .trim();


                            return (

                                animalId !== "" &&

                                status !== "adotado"

                            );

                        }
                    )

                    .map(
                        linha => ({

                            animalId:
                                String(
                                    linha[0] || ""
                                ).trim(),

                            nome:
                                linha[1] || "",

                            especie:
                                linha[2] || "",

                            raca:
                                linha[3] || "",

                            idade:
                                linha[4] || "",

                            sexo:
                                linha[5] || "",

                            descricao:
                                linha[6] || "",

                            foto:
                                linha[7] || "",

                            status:
                                linha[8] ||
                                "Disponível"

                        })
                    );


            res.json(
                animais
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar animais:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível buscar os animais."

                });

        }

    }
);


// ======================================================
// ANIMAIS DO ADMIN
// ======================================================

app.get(
    "/api/admin/animais",
    protegerAdmin,
    async (req, res) => {

        try {

            const resposta =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhas =
                resposta.data.values || [];


            const animais =
                linhas

                    .filter(
                        linha =>
                            linha.length > 0
                    )

                    .filter(
                        linha => {

                            const animalId =
                                String(
                                    linha[0] || ""
                                ).trim();


                            const status =
                                String(
                                    linha[8] || ""
                                )
                                    .toLowerCase()
                                    .trim();


                            return (

                                animalId !== "" &&

                                status !== "adotado"

                            );

                        }
                    )

                    .map(
                        linha => ({

                            animalId:
                                String(
                                    linha[0] || ""
                                ).trim(),

                            nome:
                                linha[1] || "",

                            especie:
                                linha[2] || "",

                            raca:
                                linha[3] || "",

                            idade:
                                linha[4] || "",

                            sexo:
                                linha[5] || "",

                            descricao:
                                linha[6] || "",

                            foto:
                                linha[7] || "",

                            status:
                                linha[8] ||
                                "Disponível"

                        })
                    );


            res.json(
                animais
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar animais do administrador:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível buscar os animais."

                });

        }

    }
);


// ======================================================
// CADASTRAR ANIMAL
// ======================================================
//
// Agora o administrador envia:
//
// nome
// especie
// raca
// idade
// sexo
// descricao
// foto = ARQUIVO
//
// O backend:
//
// 1. Recebe a foto
// 2. Envia para Pixhost
// 3. Recebe o link
// 4. Salva o link no Google Sheets
//
// ======================================================

app.post(
    "/api/admin/animais",
    protegerAdmin,
    upload.single("foto"),
    async (req, res) => {

        try {

            const {

                nome,

                especie,

                raca,

                idade,

                sexo,

                descricao

            } = req.body;


            const arquivoFoto =
                req.file;


            // ==========================================
            // VALIDAR CAMPOS
            // ==========================================

            if (

                !nome ||

                !especie ||

                !raca ||

                !idade ||

                !sexo ||

                !descricao ||

                !arquivoFoto

            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Preencha todos os campos e selecione uma foto."

                    });

            }


            // ==========================================
            // ENVIAR FOTO PARA O PIXHOST
            // ==========================================

            console.log(
                "Enviando foto para o Pixhost..."
            );


            const resultadoFoto =
                await enviarFotoParaPixhost(
                    arquivoFoto
                );


            const foto =
                resultadoFoto.fotoUrl;


            console.log(
                "Foto enviada para o Pixhost:"
            );

            console.log(
                foto
            );


            // ==========================================
            // BUSCAR ANIMAIS EXISTENTES
            // ==========================================

            const resposta =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhas =
                resposta.data.values || [];


            // ==========================================
            // GERAR PRÓXIMO ID
            // ==========================================

            let maiorId = 0;


            for (
                const linha of linhas
                ) {

                const id =
                    parseInt(
                        linha[0]
                    );


                if (
                    !isNaN(id) &&
                    id > maiorId
                ) {

                    maiorId = id;

                }

            }


            const novoId =
                maiorId + 1;


            // ==========================================
            // CADASTRAR NO GOOGLE SHEETS
            // ==========================================

            await sheets
                .spreadsheets
                .values
                .append({

                    spreadsheetId:
                    process.env.GOOGLE_SHEET_ID,

                    range:
                        "Animais!A:I",

                    valueInputOption:
                        "USER_ENTERED",

                    insertDataOption:
                        "INSERT_ROWS",

                    requestBody: {

                        values: [[

                            novoId,

                            nome,

                            especie,

                            raca,

                            idade,

                            sexo,

                            descricao,

                            foto,

                            "Disponível"

                        ]]

                    }

                });


            // ==========================================
            // RESPOSTA
            // ==========================================

            res.json({

                sucesso: true,

                mensagem:
                    "Animal cadastrado com sucesso!",

                animal: {

                    animalId:
                        String(novoId),

                    nome,

                    especie,

                    raca,

                    idade,

                    sexo,

                    descricao,

                    foto,

                    status:
                        "Disponível"

                }

            });


        } catch (erro) {

            console.error(
                "Erro ao cadastrar animal:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        erro.message ||
                        "Não foi possível cadastrar o animal."

                });

        }

    }
);


// ======================================================
// ALTERAR STATUS DO ANIMAL
// ======================================================

app.patch(
    "/api/admin/animais/:animalId/status",
    protegerAdmin,
    async (req, res) => {

        try {

            const {
                animalId
            } = req.params;


            const {
                status
            } = req.body;


            const statusPermitidos = [

                "Disponível",

                "Pendente",

                "Adotado"

            ];


            if (
                !statusPermitidos.includes(
                    status
                )
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Status inválido."

                    });

            }


            const resposta =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhas =
                resposta.data.values || [];


            const indiceAnimal =
                linhas.findIndex(

                    linha =>

                        String(
                            linha[0] || ""
                        ).trim() ===

                        String(
                            animalId
                        ).trim()

                );


            if (
                indiceAnimal === -1
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Animal não encontrado."

                    });

            }


            const numeroLinha =
                indiceAnimal + 2;


            await sheets
                .spreadsheets
                .values
                .update({

                    spreadsheetId:
                    process.env.GOOGLE_SHEET_ID,

                    range:
                        `Animais!I${numeroLinha}`,

                    valueInputOption:
                        "USER_ENTERED",

                    requestBody: {

                        values: [
                            [status]
                        ]

                    }

                });


            // ==========================================
            // SE FOR ADOTADO
            // ==========================================

            if (
                status === "Adotado"
            ) {

                const respostaAdocoes =
                    await sheets
                        .spreadsheets
                        .values
                        .get({

                            spreadsheetId:
                            process.env.GOOGLE_SHEET_ID,

                            range:
                                "Adocoes!A2:H"

                        });


                const linhasAdocoes =
                    respostaAdocoes.data.values || [];


                let indiceAdocao = -1;


                for (
                    let i =
                        linhasAdocoes.length - 1;

                    i >= 0;

                    i--

                ) {

                    const idAnimal =
                        String(
                            linhasAdocoes[i][1] || ""
                        ).trim();


                    const statusAdocao =
                        String(
                            linhasAdocoes[i][7] || ""
                        )
                            .toLowerCase()
                            .trim();


                    if (

                        idAnimal ===
                        String(animalId).trim() &&

                        statusAdocao ===
                        "pendente"

                    ) {

                        indiceAdocao = i;

                        break;

                    }

                }


                if (
                    indiceAdocao !== -1
                ) {

                    const numeroLinhaAdocao =
                        indiceAdocao + 2;


                    await sheets
                        .spreadsheets
                        .values
                        .update({

                            spreadsheetId:
                            process.env.GOOGLE_SHEET_ID,

                            range:
                                `Adocoes!H${numeroLinhaAdocao}`,

                            valueInputOption:
                                "USER_ENTERED",

                            requestBody: {

                                values: [
                                    ["Adotado"]
                                ]

                            }

                        });

                }

            }


            res.json({

                sucesso: true,

                mensagem:
                    `Status do animal alterado para ${status}.`

            });


        } catch (erro) {

            console.error(
                "Erro ao alterar status do animal:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível alterar o status do animal."

                });

        }

    }
);


// ======================================================
// SOLICITAR ADOÇÃO
// ======================================================

app.post(
    "/api/adocoes",
    async (req, res) => {

        try {

            const {

                animalId,

                nomeInteressado,

                email,

                telefone,

                mensagem

            } = req.body;


            if (

                !animalId ||

                !nomeInteressado ||

                !email ||

                !telefone

            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Preencha todos os campos obrigatórios."

                    });

            }


            const respostaAnimais =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhas =
                respostaAnimais.data.values || [];


            const indiceAnimal =
                linhas.findIndex(

                    linha =>

                        String(
                            linha[0] || ""
                        ).trim() ===

                        String(
                            animalId
                        ).trim()

                );


            if (
                indiceAnimal === -1
            ) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Animal não encontrado."

                    });

            }


            const statusAtual =
                String(
                    linhas[indiceAnimal][8] ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            if (
                statusAtual !==
                "disponível"
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "Este animal não está disponível para adoção."

                    });

            }


            const nomeAnimal =
                linhas[indiceAnimal][1] ||
                "";


            const data =
                new Date()
                    .toLocaleString(
                        "pt-BR"
                    );


            await sheets
                .spreadsheets
                .values
                .append({

                    spreadsheetId:
                    process.env.GOOGLE_SHEET_ID,

                    range:
                        "Adocoes!A:H",

                    valueInputOption:
                        "USER_ENTERED",

                    insertDataOption:
                        "INSERT_ROWS",

                    requestBody: {

                        values: [[

                            data,

                            animalId,

                            nomeAnimal,

                            nomeInteressado,

                            email,

                            telefone,

                            mensagem || "",

                            "Pendente"

                        ]]

                    }

                });


            const numeroLinha =
                indiceAnimal + 2;


            await sheets
                .spreadsheets
                .values
                .update({

                    spreadsheetId:
                    process.env.GOOGLE_SHEET_ID,

                    range:
                        `Animais!I${numeroLinha}`,

                    valueInputOption:
                        "USER_ENTERED",

                    requestBody: {

                        values: [
                            ["Pendente"]
                        ]

                    }

                });


            res.json({

                sucesso: true,

                mensagem:
                    "Pedido de adoção enviado com sucesso!"

            });


        } catch (erro) {

            console.error(
                "Erro ao solicitar adoção:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível enviar o pedido de adoção."

                });

        }

    }
);


// ======================================================
// HISTÓRICO DE ADOÇÕES
// ======================================================

app.get(
    "/api/admin/historico-adocoes",
    protegerAdmin,
    async (req, res) => {

        try {

            const respostaAnimais =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhasAnimais =
                respostaAnimais.data.values || [];


            const animaisAdotados =
                linhasAnimais.filter(
                    linha => {

                        const animalId =
                            String(
                                linha[0] || ""
                            ).trim();


                        const status =
                            String(
                                linha[8] || ""
                            )
                                .toLowerCase()
                                .trim();


                        return (

                            animalId !== "" &&

                            status === "adotado"

                        );

                    }
                );


            const respostaAdocoes =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Adocoes!A2:H"

                    });


            const linhasAdocoes =
                respostaAdocoes.data.values || [];


            const historico = [];


            for (
                const animal of animaisAdotados
                ) {

                const animalId =
                    String(
                        animal[0] || ""
                    ).trim();


                let pedidoEncontrado = null;


                for (
                    let i =
                        linhasAdocoes.length - 1;

                    i >= 0;

                    i--
                ) {

                    const idPedido =
                        String(
                            linhasAdocoes[i][1] || ""
                        ).trim();


                    if (
                        idPedido === animalId
                    ) {

                        pedidoEncontrado =
                            linhasAdocoes[i];

                        break;

                    }

                }


                if (
                    pedidoEncontrado
                ) {

                    historico.push({

                        data:
                            pedidoEncontrado[0] || "",

                        animalId:
                        animalId,

                        animal:
                            animal[1] || "",

                        interessado:
                            pedidoEncontrado[3] || "",

                        email:
                            pedidoEncontrado[4] || "",

                        telefone:
                            pedidoEncontrado[5] || "",

                        mensagem:
                            pedidoEncontrado[6] || "",

                        status:
                            "Adotado"

                    });

                }

            }


            res.json(
                historico
            );


        } catch (erro) {

            console.error(
                "Erro ao buscar histórico de adoções:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível buscar o histórico de adoções."

                });

        }

    }
);


// ======================================================
// HISTÓRICO DE UM ANIMAL ESPECÍFICO
// ======================================================

app.get(
    "/api/admin/animais/:animalId/historico",
    protegerAdmin,
    async (req, res) => {

        try {

            const {
                animalId
            } = req.params;


            const respostaAnimal =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Animais!A2:I"

                    });


            const linhasAnimais =
                respostaAnimal.data.values || [];


            const animal =
                linhasAnimais.find(

                    linha =>

                        String(
                            linha[0] || ""
                        ).trim() ===

                        String(
                            animalId
                        ).trim()

                );


            if (!animal) {

                return res
                    .status(404)
                    .json({

                        erro:
                            "Animal não encontrado."

                    });

            }


            const respostaAdocoes =
                await sheets
                    .spreadsheets
                    .values
                    .get({

                        spreadsheetId:
                        process.env.GOOGLE_SHEET_ID,

                        range:
                            "Adocoes!A2:H"

                    });


            const linhasAdocoes =
                respostaAdocoes.data.values || [];


            const historico =
                linhasAdocoes

                    .filter(
                        linha =>

                            String(
                                linha[1] || ""
                            ).trim() ===

                            String(
                                animalId
                            ).trim()

                    )

                    .map(
                        linha => ({

                            data:
                                linha[0] || "",

                            animalId:
                                linha[1] || "",

                            animal:
                                linha[2] || "",

                            interessado:
                                linha[3] || "",

                            email:
                                linha[4] || "",

                            telefone:
                                linha[5] || "",

                            mensagem:
                                linha[6] || "",

                            status:
                                linha[7] || ""

                        })
                    );


            res.json({

                animal: {

                    animalId:
                        String(
                            animal[0] || ""
                        ).trim(),

                    nome:
                        animal[1] || "",

                    especie:
                        animal[2] || "",

                    raca:
                        animal[3] || "",

                    idade:
                        animal[4] || "",

                    sexo:
                        animal[5] || "",

                    descricao:
                        animal[6] || "",

                    foto:
                        animal[7] || "",

                    status:
                        animal[8] ||
                        "Disponível"

                },

                historico

            });


        } catch (erro) {

            console.error(
                "Erro ao buscar histórico do animal:",
                erro
            );


            res
                .status(500)
                .json({

                    erro:
                        "Não foi possível buscar o histórico do animal."

                });

        }

    }
);


// ======================================================
// TESTE ADMIN
// ======================================================

app.get(
    "/api/admin/teste",
    protegerAdmin,
    (req, res) => {

        res.json({

            sucesso: true,

            mensagem:
                "Área administrativa protegida funcionando! 🔐"

        });

    }
);


// ======================================================
// TRATAMENTO DE ERRO DO UPLOAD
// ======================================================

app.use(
    (erro, req, res, next) => {

        console.error(
            "Erro:",
            erro
        );


        if (
            erro instanceof multer.MulterError
        ) {

            if (
                erro.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(400)
                    .json({

                        erro:
                            "A foto não pode ter mais de 10 MB."

                    });

            }


            return res
                .status(400)
                .json({

                    erro:
                        "Erro ao enviar a foto."

                });

        }


        if (
            erro &&
            erro.message &&
            erro.message.includes(
                "Formato de imagem"
            )
        ) {

            return res
                .status(400)
                .json({

                    erro:
                    erro.message

                });

        }


        res
            .status(500)
            .json({

                erro:
                    erro.message ||
                    "Erro interno do servidor."

            });

    }
);


// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

    }
);