document.addEventListener("DOMContentLoaded", () => {
    // Cada función se ejecuta de forma aislada: si una falla (por ejemplo,
    // el muro por un corte de wifi), el resto de la página sigue funcionando.
    const features = [
        initTabs,
        initAccordion,
        initHamburgerMenu,
        initReveal,
        initScrollProgress,
        initScrollSpy,
        initBackToTop,
        initQuoteCards,
        initMiniMuros,
        initDebateWall
    ];

    features.forEach(fn => {
        try {
            fn();
        } catch (error) {
            console.error(`No se pudo iniciar ${fn.name}:`, error);
        }
    });
});

/* ==========================================
   1. LÓGICA DE PESTAÑAS (TABS)
   ========================================== */
function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            // Desactivar todos los botones y contenidos
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            // Activar botón claqueado y su pestaña
            btn.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });
}

/* ==========================================
   1.b LÓGICA DEL MENÚ HAMBURGUESA (MOBILE)
   ========================================== */
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navMenu = document.getElementById("navMenu");

    if (!hamburgerBtn || !navMenu) return;

    // Abrir / cerrar el menú al tocar el botón hamburguesa
    hamburgerBtn.addEventListener("click", () => {
        const isOpen = navMenu.classList.toggle("active");
        hamburgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Cerrar el menú automáticamente al tocar un link (mejor experiencia mobile)
    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
            hamburgerBtn.setAttribute("aria-expanded", "false");
        });
    });
}

/* ==========================================
   2. LÓGICA DEL ACORDEÓN
   ========================================== */
function initAccordion() {
    const acc = document.getElementsByClassName("accordion-btn");

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const isOpen = this.classList.contains("active");
            this.setAttribute("aria-expanded", isOpen ? "true" : "false");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
}

/* ==========================================
   3. SISTEMA DE MURO DE DEBATE (CIERRE GENERAL)
   ========================================== */
function initDebateWall() {
    const container = document.querySelector(".iframe-container");

    if (!container) return;

    // Renderizado directo de los campos del formulario en el DOM
    container.innerHTML = `
        <div style="width: 100%; text-align: left; padding: 1rem;">
            <form id="commentForm" style="display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem;">
                <input type="text" id="authorInput" placeholder="Tu Nombre o Grupo..." required 
                    style="padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.95rem;">
                <textarea id="commentInput" placeholder="Escribí tu respuesta o reflexión acá..." rows="3" required 
                    style="padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.95rem; resize: vertical;"></textarea>
                <button type="submit" id="submitCommentBtn"
                    style="background-color: #f59e0b; color: white; border: none; padding: 0.7rem 1.4rem; font-weight: bold; border-radius: 6px; cursor: pointer; align-self: flex-start; font-size: 0.95rem;">
                    🚀 Publicar Comentario
                </button>
            </form>

            <h3 style="color: #1e3a8a; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.4rem;">
                Comentarios en Vivo:
            </h3>
            <div id="commentsList" style="display: flex; flex-direction: column; gap: 0.8rem;">
                <p id="noCommentsText" style="color: #64748b; font-style: italic;">Cargando comentarios...</p>
            </div>
        </div>
    `;

    const commentForm = document.getElementById("commentForm");
    const commentsList = document.getElementById("commentsList");
    const submitBtn = document.getElementById("submitCommentBtn");

    // Si firebase-config.js no cargó bien (o falta completar los datos), avisamos y frenamos acá
    if (typeof db === "undefined") {
        commentsList.innerHTML = `<p style="color:#dc2626;">⚠️ No se pudo conectar con la base de datos. Revisá que firebase-config.js tenga tus datos de Firebase.</p>`;
        return;
    }

    // Escucha en tiempo real: cada vez que alguien agrega un comentario,
    // TODAS las computadoras conectadas reciben la actualización automáticamente.
    db.collection("comentarios")
        .orderBy("fecha", "desc")
        .limit(150)
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                commentsList.innerHTML = `<p id="noCommentsText" style="color: #64748b; font-style: italic;">Aún no hay respuestas. ¡Sé el primero en comentar!</p>`;
                return;
            }

            commentsList.innerHTML = "";
            snapshot.forEach(doc => {
                const data = doc.data();

                const commentCard = document.createElement("div");
                commentCard.style.cssText = `
                    background: #ffffff;
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid #f59e0b;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    animation: fadeIn 0.4s ease-out;
                `;

                commentCard.innerHTML = `
                    <strong style="color: #1e3a8a; display: block; margin-bottom: 0.3rem;">${escapeHTML(data.autor || "")}</strong>
                    <p style="margin: 0; color: #334155;">${escapeHTML(data.texto || "")}</p>
                `;

                commentsList.appendChild(commentCard);
            });
        }, error => {
            commentsList.innerHTML = `<p style="color:#dc2626;">⚠️ Error al cargar los comentarios: ${error.message}</p>`;
        });

    commentForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const author = document.getElementById("authorInput").value.trim();
        const text = document.getElementById("commentInput").value.trim();

        if (author && text) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Publicando...";

            db.collection("comentarios").add({
                autor: author,
                texto: text,
                seccion: "general",
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                commentForm.reset();
            }).catch(error => {
                alert("Hubo un error al publicar el comentario: " + error.message);
            }).finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = "🚀 Publicar Comentario";
            });
        }
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Desplazamiento suave con compensación de menú
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Calcula la posición descontando la altura del header fijo
            const headerOffset = 130;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ==========================================
   4. REVELADO DE SECCIONES AL HACER SCROLL
   ========================================== */
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    // Si el navegador no soporta IntersectionObserver, mostramos todo directo
    if (!("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(el => observer.observe(el));
}

/* ==========================================
   5. BARRA DE PROGRESO DE LECTURA
   ========================================== */
function initScrollProgress() {
    const fill = document.getElementById("progressFill");
    if (!fill) return;

    let ticking = false;

    function update() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
        fill.style.width = pct + "%";
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    });

    update();
}

/* ==========================================
   6. SCROLLSPY: RESALTA LA SECCIÓN VISIBLE EN EL MENÚ
   ========================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-menu a[href^='#']");
    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

    const linkFor = id => document.querySelector(`.nav-menu a[href="#${id}"]`);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const link = linkFor(entry.target.id);
            if (!link) return;
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove("active-scroll"));
                link.classList.add("active-scroll");
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

/* ==========================================
   7. BOTÓN FLOTANTE "VOLVER ARRIBA"
   ========================================== */
function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 500) {
            btn.classList.add("is-visible");
        } else {
            btn.classList.remove("is-visible");
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ==========================================
   8. FRASES CLAVE DESPLEGABLES (QUOTE CARDS)
   ========================================== */
function initQuoteCards() {
    document.querySelectorAll(".quote-card").forEach(card => {
        card.addEventListener("click", () => {
            const isOpen = card.getAttribute("aria-expanded") === "true";
            card.setAttribute("aria-expanded", isOpen ? "false" : "true");

            // Si la frase está dentro de un acordeón ya abierto, su max-height
            // fijo (calculado al abrir) puede recortar el texto que se revela.
            // Lo liberamos para que se acomode al nuevo contenido.
            const parentPanel = card.closest(".panel");
            if (parentPanel && parentPanel.style.maxHeight) {
                parentPanel.style.maxHeight = "none";
            }
        });
    });
}

/* ==========================================
   9. MINI-MUROS DE COMENTARIOS POR SECCIÓN
   ========================================== */
function initMiniMuros() {
    const muros = document.querySelectorAll(".mini-muro[data-seccion]");

    muros.forEach(muro => {
        const seccion = muro.dataset.seccion;
        const toggleBtn = muro.querySelector(".mini-muro-toggle");
        const body = muro.querySelector(".mini-muro-body");
        const countEl = muro.querySelector(".mini-muro-count");

        if (!toggleBtn || !body) return;

        toggleBtn.addEventListener("click", () => {
            const isOpen = muro.classList.toggle("is-open");
            toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

            // Recién conectamos con Firebase la primera vez que se abre el panel
            if (isOpen && !muro.dataset.initialized) {
                muro.dataset.initialized = "true";
                renderMiniMuro(body, seccion, countEl);
            }
        });
    });
}

function renderMiniMuro(body, seccion, countEl) {
    body.innerHTML = `
        <form class="mini-form">
            <input type="text" class="mini-input" placeholder="Tu Nombre o Grupo..." required>
            <textarea class="mini-textarea" rows="2" placeholder="Escribí tu comentario acá..." required></textarea>
            <button type="submit" class="mini-submit">💬 Comentar</button>
        </form>
        <div class="mini-comments">
            <p class="mini-empty">Cargando comentarios...</p>
        </div>
    `;

    const form = body.querySelector(".mini-form");
    const list = body.querySelector(".mini-comments");
    const submitBtn = body.querySelector(".mini-submit");

    if (typeof db === "undefined") {
        list.innerHTML = `<p class="mini-error">⚠️ No se pudo conectar con la base de datos. Revisá firebase-config.js.</p>`;
        return;
    }

    // Filtramos solo por "seccion" (sin orderBy) para NO depender de un índice
    // compuesto de Firestore. El orden por fecha lo hacemos acá, en el navegador.
    db.collection("comentarios")
        .where("seccion", "==", seccion)
        .limit(50)
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                if (countEl) countEl.textContent = "";
                list.innerHTML = `<p class="mini-empty">Todavía no hay comentarios en esta sección. ¡Sé el primero!</p>`;
                return;
            }

            // Ordenamos de más nuevo a más viejo. Un comentario recién enviado
            // puede tener "fecha" en null por un instante: lo tratamos como el más nuevo.
            const docs = snapshot.docs.slice().sort((a, b) => {
                const fa = a.data().fecha;
                const fb = b.data().fecha;
                const ta = fa && fa.toMillis ? fa.toMillis() : Infinity;
                const tb = fb && fb.toMillis ? fb.toMillis() : Infinity;
                return tb - ta;
            }).slice(0, 15);

            if (countEl) countEl.textContent = String(docs.length);

            list.innerHTML = "";
            docs.forEach(doc => {
                const data = doc.data();
                const card = document.createElement("div");
                card.className = "mini-comment";
                card.innerHTML = `
                    <strong>${escapeHTML(data.autor || "")}</strong>
                    <p>${escapeHTML(data.texto || "")}</p>
                `;
                list.appendChild(card);
            });
        }, error => {
            list.innerHTML = `<p class="mini-error">⚠️ Error al cargar los comentarios: ${error.message}</p>`;
        });

    form.addEventListener("submit", e => {
        e.preventDefault();
        const authorInput = form.querySelector(".mini-input");
        const textInput = form.querySelector(".mini-textarea");
        const author = authorInput.value.trim();
        const text = textInput.value.trim();

        if (!author || !text) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Publicando...";

        db.collection("comentarios").add({
            autor: author,
            texto: text,
            seccion: seccion,
            fecha: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            form.reset();
        }).catch(error => {
            alert("Hubo un error al publicar el comentario: " + error.message);
        }).finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "💬 Comentar";
        });
    });
}
