import './style.css'

const API_URL = 'https://conectapet-api-8h7r.onrender.com'


// ==========================================
// CARREGAR ANIMAIS
// ==========================================

async function carregarAnimais() {

    const app = document.querySelector('#app')

    app.innerHTML = `

        <!-- ==========================================
             MENU
        ========================================== -->

        <header class="menu">

            <div class="logo">
                🐾 ConectaPet
            </div>

            <nav>

                <a href="#inicio">
                    Início
                </a>

                <a href="#sobre">
                    Sobre nós
                </a>

                <a href="#animais">
                    Animais
                </a>

                <a href="#contato">
                    Contato
                </a>

            </nav>

        </header>


        <!-- ==========================================
             INÍCIO
        ========================================== -->

        <section id="inicio" class="secao-inicio">

            <div class="inicio-conteudo">

                <div class="inicio-texto">

                    <h1>
                        🐾 ConectaPet
                    </h1>

                    <h2>
                        Encontre um novo amigo!
                    </h2>

                    <p>
                        Aqui você pode conhecer animais
                        que estão esperando por um novo lar,
                        cheio de amor, carinho e cuidado.
                    </p>

                    <button
                        class="btn-conhecer"
                        id="btn-conhecer-animais"
                    >
                        🐾 Conheça nossos animais
                    </button>

                </div>


                <!-- ==========================================
                     LOGO
                ========================================== -->

                <div class="inicio-imagem">

                    <img
                        src="/logoAtualizada.png"
                        alt="Logo ConectaPet"
                        class="logo-banner"
                    >

                </div>

            </div>

        </section>


        <!-- ==========================================
             SOBRE NÓS
        ========================================== -->

        <section
            id="sobre"
            class="secao-sobre"
        >

            <div class="conteudo-secao">

                <h2>
                    💜 Sobre nós
                </h2>

                <p>
                    O <strong>ConectaPet</strong> é um programa
                    voluntário criado em parceria com os cursos
                    de <strong>Sistemas de Informação</strong> e
                    <strong>Medicina Veterinária</strong>, com o
                    objetivo de contribuir para a divulgação de
                    animais que estão aguardando por um novo lar.
                </p>

                <p>
                    O projeto também conta com a parceria do
                    <strong>Centro de Zoonoses</strong>, buscando
                    dar mais visibilidade aos animais disponíveis
                    para adoção.
                </p>

                <p>
                    Através do ConectaPet, você pode conhecer
                    os animais, visualizar suas informações e
                    demonstrar interesse em realizar uma adoção.
                </p>

            </div>

        </section>


        <!-- ==========================================
             ANIMAIS
        ========================================== -->

        <section
            id="animais"
            class="secao-animais"
        >

            <h2 class="titulo-animais">
                🐾 Animais disponíveis
            </h2>

            <p class="subtitulo-animais">
                Encontre seu novo companheiro!
            </p>

            <p id="carregando-animais">
                Carregando animais...
            </p>

            <div id="lista-animais">

            </div>

        </section>


        <!-- ==========================================
             FORMULÁRIO DE ADOÇÃO
        ========================================== -->

        <div
            id="formulario-adocao"
            class="formulario-escondido"
        >

            <div class="formulario-conteudo">

                <button
                    type="button"
                    id="fechar-formulario"
                    class="btn-fechar"
                >
                    ✖
                </button>


                <h2>
                    🐾 Quero adotar
                </h2>


                <p>
                    Você está interessado em adotar:
                </p>


                <h3 id="nome-animal-formulario">
                </h3>


                <form id="form-adocao">

                    <!-- ID DO ANIMAL -->

                    <input
                        type="hidden"
                        id="animal-id"
                    >


                    <!-- NOME -->

                    <label for="nome-interessado">
                        Nome completo
                    </label>

                    <input
                        type="text"
                        id="nome-interessado"
                        placeholder="Digite seu nome completo"
                        required
                    >


                    <!-- EMAIL -->

                    <label for="email">
                        E-mail
                    </label>

                    <input
                        type="email"
                        id="email"
                        placeholder="Digite seu e-mail"
                        required
                    >


                    <!-- TELEFONE -->

                    <label for="telefone">
                        Telefone
                    </label>

                    <input
                        type="tel"
                        id="telefone"
                        placeholder="Digite seu telefone"
                        required
                    >


                    <!-- MENSAGEM -->

                    <label for="mensagem">
                        Por que você quer adotar?
                    </label>

                    <textarea
                        id="mensagem"
                        placeholder="Conte um pouco sobre você..."
                        rows="5"
                    ></textarea>


                    <!-- BOTÃO -->

                    <button
                        type="submit"
                        class="btn-enviar"
                    >
                        📩 Enviar pedido de adoção
                    </button>

                </form>


                <p id="mensagem-formulario">
                </p>

            </div>

        </div>


        <!-- ==========================================
             CONTATO
        ========================================== -->

        <section
            id="contato"
            class="secao-contato"
        >

            <div class="conteudo-secao">

                <h2>
                    📞 Contato
                </h2>

                <p>
                    Quer saber mais sobre o ConectaPet?
                    Entre em contato conosco.
                </p>


                <div class="contatos">

                    <div class="contato-item">

                        <span>
                            📧
                        </span>

                        <div>

                            <h3>
                                E-mail
                            </h3>

                            <p>
                                thay.ewe02@email.com
                            </p>

                        </div>

                    </div>


                    <div class="contato-item">

                        <span>
                            📱
                        </span>

                        <div>

                            <h3>
                                Instagram
                            </h3>

                            <p>
                                @thay.evy
                            </p>

                        </div>

                    </div>


                    <div class="contato-item">

                        <span>
                            🐾
                        </span>

                        <div>

                            <h3>
                                Adoção
                            </h3>

                            <p>
                                Conheça nossos animais
                                e encontre seu novo amigo.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </section>


        <!-- ==========================================
             RODAPÉ
        ========================================== -->

        <footer>

            <p>
                🐾 ConectaPet
            </p>

            <p>
                Conectando animais a novos lares.
            </p>

        </footer>

    `


    // ==========================================
    // BUSCAR ANIMAIS
    // ==========================================

    try {

        const resposta =
            await fetch(
                `${API_URL}/api/animais`
            )


        if (!resposta.ok) {

            throw new Error(
                'Erro ao buscar animais.'
            )

        }


        const animais =
            await resposta.json()


        const lista =
            document.querySelector(
                '#lista-animais'
            )


        const carregando =
            document.querySelector(
                '#carregando-animais'
            )


        carregando.remove()


        // ==========================================
        // MOSTRAR ANIMAIS
        // ==========================================

        lista.innerHTML = animais.map(animal => {

            const status =
                (animal.status || '')
                    .trim()
                    .toLowerCase()


            let botao = ''


            // ==========================================
            // ANIMAL DISPONÍVEL
            // ==========================================

            if (
                status === 'disponível' ||
                status === 'disponivel'
            ) {

                botao = `

                    <button
                        class="btn-adotar"
                        data-animal-id="${animal.animalId}"
                    >
                        🐾 Quero adotar
                    </button>

                `

            }


                // ==========================================
                // ANIMAL PENDENTE
            // ==========================================

            else if (
                status === 'pendente'
            ) {

                botao = `

                    <button
                        class="btn-pendente"
                        disabled
                    >
                        ⏳ Adoção em análise
                    </button>

                `

            }


            return `

                <div class="animal">

                    <img
                        src="${animal.foto}"
                        alt="${animal.nome}"
                    >

                    <h2>
                        ${animal.nome}
                    </h2>

                    <p>
                        <strong>Espécie:</strong>
                        ${animal.especie}
                    </p>

                    <p>
                        <strong>Raça:</strong>
                        ${animal.raca}
                    </p>

                    <p>
                        <strong>Idade:</strong>
                        ${animal.idade}
                    </p>

                    <p>
                        <strong>Sexo:</strong>
                        ${animal.sexo}
                    </p>

                    <p>
                        ${animal.descricao}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${animal.status}
                    </p>

                    ${botao}

                </div>

            `

        }).join('')


        // ==========================================
        // BOTÕES "QUERO ADOTAR"
        // ==========================================

        const botoes =
            document.querySelectorAll(
                '.btn-adotar'
            )


        botoes.forEach(botao => {

            botao.addEventListener(
                'click',
                () => {

                    const animalId =
                        botao.dataset.animalId


                    // Procurar o animal

                    const animal =
                        animais.find(
                            animal =>
                                animal.animalId ===
                                animalId
                        )


                    if (!animal) {

                        alert(
                            'Animal não encontrado.'
                        )

                        return
                    }


                    // Verificar status

                    const status =
                        (animal.status || '')
                            .trim()
                            .toLowerCase()


                    if (
                        status !== 'disponível' &&
                        status !== 'disponivel'
                    ) {

                        alert(
                            'Este animal não está disponível para adoção.'
                        )

                        return
                    }


                    abrirFormularioAdocao(
                        animal.animalId,
                        animal.nome
                    )

                }
            )

        })


        // ==========================================
        // BOTÃO FECHAR
        // ==========================================

        const fechar =
            document.querySelector(
                '#fechar-formulario'
            )


        fechar.addEventListener(
            'click',
            () => {

                fecharFormularioAdocao()

            }
        )


        // ==========================================
        // FORMULÁRIO
        // ==========================================

        const formulario =
            document.querySelector(
                '#form-adocao'
            )


        formulario.addEventListener(
            'submit',
            enviarAdocao
        )


        // ==========================================
        // BOTÃO CONHECER ANIMAIS
        // ==========================================

        const botaoConhecer =
            document.querySelector(
                '#btn-conhecer-animais'
            )


        botaoConhecer.addEventListener(
            'click',
            () => {

                document
                    .querySelector('#animais')
                    .scrollIntoView({
                        behavior: 'smooth'
                    })

            }
        )


    } catch (erro) {

        console.error(erro)


        const lista =
            document.querySelector(
                '#lista-animais'
            )


        const carregando =
            document.querySelector(
                '#carregando-animais'
            )


        if (carregando) {
            carregando.remove()
        }


        lista.innerHTML = `

            <p class="erro-animais">

                ❌ Não foi possível carregar
                os animais.

                <br><br>

                Verifique se o backend
                está funcionando.

            </p>

        `

    }

}


// ==========================================
// ABRIR FORMULÁRIO
// ==========================================

function abrirFormularioAdocao(
    animalId,
    animalNome
) {

    const formulario =
        document.querySelector(
            '#formulario-adocao'
        )


    const campoAnimal =
        document.querySelector(
            '#animal-id'
        )


    const nomeAnimal =
        document.querySelector(
            '#nome-animal-formulario'
        )


    campoAnimal.value =
        animalId


    nomeAnimal.innerText =
        animalNome


    formulario.classList.remove(
        'formulario-escondido'
    )

}


// ==========================================
// FECHAR FORMULÁRIO
// ==========================================

function fecharFormularioAdocao() {

    const formulario =
        document.querySelector(
            '#formulario-adocao'
        )


    formulario.classList.add(
        'formulario-escondido'
    )


    const mensagem =
        document.querySelector(
            '#mensagem-formulario'
        )


    mensagem.innerText = ''

}


// ==========================================
// ENVIAR ADOÇÃO
// ==========================================

async function enviarAdocao(evento) {

    evento.preventDefault()


    // ==========================================
    // PEGAR DADOS
    // ==========================================

    const animalId =
        document.querySelector(
            '#animal-id'
        ).value.trim()


    const nomeInteressado =
        document.querySelector(
            '#nome-interessado'
        ).value.trim()


    const email =
        document.querySelector(
            '#email'
        ).value.trim()


    const telefone =
        document.querySelector(
            '#telefone'
        ).value.trim()


    const mensagem =
        document.querySelector(
            '#mensagem'
        ).value.trim()


    const mensagemFormulario =
        document.querySelector(
            '#mensagem-formulario'
        )


    // ==========================================
    // VALIDAR ANIMAL
    // ==========================================

    if (!animalId) {

        mensagemFormulario.innerText =
            '❌ Não foi possível identificar o animal.'

        return
    }


    // ==========================================
    // VALIDAR NOME
    // ==========================================

    if (!nomeInteressado) {

        mensagemFormulario.innerText =
            '❌ Informe seu nome.'

        return
    }


    // ==========================================
    // VALIDAR EMAIL
    // ==========================================

    if (!email) {

        mensagemFormulario.innerText =
            '❌ Informe seu e-mail.'

        return
    }


    // ==========================================
    // VALIDAR TELEFONE
    // ==========================================

    if (!telefone) {

        mensagemFormulario.innerText =
            '❌ Informe seu telefone.'

        return
    }


    // ==========================================
    // DADOS
    // ==========================================

    const dados = {

        animalId:
        animalId,

        nomeInteressado:
        nomeInteressado,

        email:
        email,

        telefone:
        telefone,

        mensagem:
        mensagem

    }


    console.log(
        'Dados enviados para o backend:',
        dados
    )


    mensagemFormulario.innerText =
        '⏳ Enviando pedido...'


    try {

        const resposta =
            await fetch(
                `${API_URL}/api/adocoes`,
                {

                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(dados)

                }
            )


        const resultado =
            await resposta.json()


        // ==========================================
        // ERRO
        // ==========================================

        if (!resposta.ok) {

            throw new Error(
                resultado.erro ||
                'Não foi possível enviar o pedido.'
            )

        }


        // ==========================================
        // SUCESSO
        // ==========================================

        mensagemFormulario.innerText =
            '✅ Pedido enviado com sucesso!'


        document
            .querySelector('#form-adocao')
            .reset()


        setTimeout(() => {

            fecharFormularioAdocao()

            carregarAnimais()

        }, 2000)


    } catch (erro) {

        console.error(
            'Erro ao enviar adoção:',
            erro
        )


        mensagemFormulario.innerText =
            `❌ ${erro.message}`

    }

}


// ==========================================
// INICIAR
// ==========================================

carregarAnimais()