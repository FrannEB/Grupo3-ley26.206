document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initAccordion();
    initDebateWall();
    initHamburgerMenu();
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
        navMenu.classList.toggle("active");
    });

    // Cerrar el menú automáticamente al tocar un link (mejor experiencia mobile)
    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
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
   3. SISTEMA DE MURO DE DEBATE
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

