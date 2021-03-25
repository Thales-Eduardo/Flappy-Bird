function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

class Barreira {
    constructor(reversa = false) {
        this.elemento = novoElemento('div', 'barreira')

        const borda = novoElemento('div', 'borda')
        const corpo = novoElemento('div', 'corpo')
        this.elemento.appendChild(reversa ? corpo : borda)
        this.elemento.appendChild(reversa ? borda : corpo)

        this.setAltura = altura => corpo.style.height = `${altura}px`
    }
}

class ParDeBarreiras {
    constructor(altura, abertura, x) {
        this.elemento = novoElemento('div', 'par-de-bareiras')

        this.superior = new Barreira(true)
        this.inferior = new Barreira(false)

        this.elemento.appendChild(this.superior.elemento)
        this.elemento.appendChild(this.inferior.elemento)

        this.sortearAbertura = () => {
            const alturaSuperior = Math.random() * (altura - abertura)
            const alturaInferior = altura - abertura - alturaSuperior
            this.superior.setAltura(alturaSuperior)
            this.inferior.setAltura(alturaInferior)
        }
        this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
        this.setX = x => this.elemento.style.left = `${x}px`
        this.getLargura = () => this.elemento.clientWidth

        this.sortearAbertura()
        this.setX(x)
    }
}

class Barreiras {
    constructor(altura, largura, abertura, espaco, notificarPonto) {
        this.pares = [
            new ParDeBarreiras(altura, abertura, largura),
            new ParDeBarreiras(altura, abertura, largura + espaco),
            new ParDeBarreiras(altura, abertura, largura + espaco * 2),
            new ParDeBarreiras(altura, abertura, largura + espaco * 3)
        ]
        const deslocamento = 3
        this.animar = () => {
            this.pares.forEach(par => {
                par.setX(par.getX() - deslocamento)
                if (par.getX() < -par.getLargura()) {
                    par.setX(par.getX() + espaco * this.pares.length)
                    par.sortearAbertura()
                }
                const meio = largura / 2
                const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio

                if (cruzouOMeio)
                    notificarPonto()
            })
        }
    }
}

class Passaro {
    constructor(alturaDojogo) {
        let voando = false
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'imgs/passaro.png'

        this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
        this.setY = y => this.elemento.style.bottom = `${y}px`


        window.onkeydown = e => voando = true
        window.onkeyup = e => voando = false

        window.onmousedown = e => voando = true
        window.onmouseup = e => voando = false

        window.ontouchstart = e => voando = true
        window.ontouchend = e => voando = false

        this.animar = () => {
            const novoY = this.getY() + (voando ? 8 : -5)
            const alturaMaxima = alturaDojogo - this.elemento.clientHeight

            if (novoY <= 0) {
                this.setY(0)
            } else if (novoY >= alturaMaxima) {
                this.setY(alturaMaxima)
            } else {
                this.setY(novoY)
            }
        }
        this.setY(alturaDojogo / 2)
    }
}

class Progresso {
    constructor() {
        this.elemento = novoElemento('span', 'progresso')
        this.atualizarPontos = pontos => {
            this.elemento.innerHTML = pontos
        }
        this.atualizarPontos(0)
    }
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

class FlappyBird {
    constructor() {
        let pontos = 0

        const areaTotalDoJogo = document.querySelector('[wm-flappy]')
        const altura = areaTotalDoJogo.clientHeight
        const largura = areaTotalDoJogo.clientWidth

        const progresso = new Progresso()
        const barreiras = new Barreiras(altura, largura, 240, 450,
            () => progresso.atualizarPontos(++pontos))
        const passaro = new Passaro(altura)

        areaTotalDoJogo.appendChild(progresso.elemento)
        areaTotalDoJogo.appendChild(passaro.elemento)
        barreiras.pares.forEach(par => areaTotalDoJogo.appendChild(par.elemento))

        this.start = () => {
            const temporizador = setInterval(() => {
                barreiras.animar()
                passaro.animar()
                const img = document.querySelector('img')
                if (colidiu(passaro, barreiras)) {
                    clearInterval(temporizador)
                    img.src = "imgs/go.png"
                    setInterval(() => {
                        window.location.reload()
                    }, 1300)
                }
            }, 20)
        }

    }
}

new FlappyBird().start()