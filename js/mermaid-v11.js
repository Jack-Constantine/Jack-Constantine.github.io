(() => {
  const MERMAID_URL =
    'https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.esm.min.mjs';

  let mermaidPromise = null;
  let initialized = false;

  const config = {
  startOnLoad: false,

  theme: "base",

  look: "handDrawn",

  handDrawnSeed: 7,


  flowchart: {
    useMaxWidth: true,

    nodeSpacing: 70,

    rankSpacing: 70,

    curve: "basis"
  },


  themeVariables: {

    fontSize: "18px",

    fontFamily:
      "Fira Code, JetBrains Mono, Microsoft YaHei, sans-serif",


    primaryColor:"#a5f3fc",
    primaryTextColor:"#1f2937",
    primaryBorderColor:"#f472b6",

    lineColor:"#f9a8d4",

    secondaryColor:"#fde68a",
    tertiaryColor:"#c4b5fd"
  }
};

  function loadMermaid() {
    if (!mermaidPromise) {
      mermaidPromise = import(MERMAID_URL).then(module => module.default);
    }

    return mermaidPromise;
  }

  async function renderMermaid() {
    const nodes = document.querySelectorAll(
      '.mermaid:not([data-processed="true"])'
    );

    // 当前页面没有 Mermaid，就连 Mermaid JS 都不下载
    if (!nodes.length) {
      return;
    }

    const mermaid = await loadMermaid();

    if (!initialized) {
      mermaid.initialize(config);

      // 方便 F12 Console 调试
      window.mermaid = mermaid;

      initialized = true;
    }

    await mermaid.run({
      nodes: nodes,
      suppressErrors: false
    });
    enableMermaidFullscreen();
  }

  function start() {
    renderMermaid().catch(console.error);

    // 兼容 Fluid 页面刷新机制
    if (
      window.Fluid &&
      Fluid.events &&
      Fluid.events.registerRefreshCallback
    ) {
      Fluid.events.registerRefreshCallback(() => {
        renderMermaid().catch(console.error);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();

function enableMermaidFullscreen(){

  document.querySelectorAll(".mermaid svg")
    .forEach(svg=>{

      if(svg.dataset.zoomEnabled){
        return;
      }

      svg.dataset.zoomEnabled=true;


      svg.style.cursor="zoom-in";


      svg.addEventListener("click",()=>{

        const overlay=document.createElement("div");

        overlay.className="mermaid-overlay";


        const clone=svg.cloneNode(true);


        clone.style.width="95vw";
        clone.style.height="95vh";


        overlay.appendChild(clone);


        document.body.appendChild(overlay);


        overlay.onclick=()=>{

          overlay.remove();

        };


        document.addEventListener(
          "keydown",
          function esc(e){

            if(e.key==="Escape"){

              overlay.remove();

              document.removeEventListener(
                "keydown",
                esc
              );

            }

          }
        );


      });


    });

}