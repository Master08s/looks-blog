var main = (function (a) {
  "use strict";
  var l = typeof document < "u" ? document.currentScript : null;
  function m() {
    try {
      const tocElement = document.getElementById("toc");
      const postContent = document.getElementById("post-content");

      if (!tocElement || !postContent) {
        return;
      }

      const headings = postContent.querySelectorAll("h1, h2, h3, h4");
      if (!headings || headings.length === 0) {
        return;
      }

      headings.forEach((heading) => {
        if (!heading || !heading.tagName || !heading.id) {
          return;
        }

        const level = parseInt(heading.tagName.substring(1));
        const tocItem = document.createElement("div");
        tocItem.className = "toc-item-level-" + level;

        const link = document.createElement("a");
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent || '';

        tocItem.appendChild(link);
        tocElement.appendChild(tocItem);
      });
    } catch (error) {
      console.warn('TOC generation failed:', error);
    }
  }
  function p() {
    try {
      let currentId = null;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const tocLink = document.querySelector(`#toc a[href="#${id}"]`);

          if (entry.isIntersecting && currentId !== id && tocLink) {
            // Remove active class from previous item
            if (currentId) {
              const prevLink = document.querySelector(`#toc a[href="#${currentId}"]`);
              if (prevLink && prevLink.parentElement) {
                prevLink.parentElement.classList.remove("active");
              }
            }

            // Add active class to current item
            if (tocLink.parentElement) {
              tocLink.parentElement.classList.add("active");
              currentId = id;
            }
          }
        });
      }, {});

      const headings = document.querySelectorAll("#post-content h1, h2, h3, h4");
      if (headings) {
        headings.forEach((heading) => {
          if (heading) {
            observer.observe(heading);
          }
        });
      }
    } catch (error) {
      console.warn('TOC scroll highlighting failed:', error);
    }
  }
  function f() {
    try {
      const tocLinks = document.querySelectorAll("#toc a");
      if (!tocLinks) {
        return;
      }

      tocLinks.forEach((link) => {
        if (!link) {
          return;
        }

        link.addEventListener("click", function () {
          // Remove active class from all items
          const activeItems = document.querySelectorAll("#toc .active");
          if (activeItems) {
            activeItems.forEach((item) => {
              if (item && item.classList) {
                item.classList.remove("active");
              }
            });
          }

          // Add active class to clicked item
          if (link.parentElement && link.parentElement.classList) {
            link.parentElement.classList.add("active");
          }
        });
      });
    } catch (error) {
      console.warn('TOC click highlighting failed:', error);
    }
  }
  function h() {
    const e = document.getElementById("upvote-button"),
      t = e.dataset.postId,
      o = "upvote.post.ids";
    d(o).includes(t) && u(e),
      e.addEventListener("click", function () {
        g(t, o, e);
      });
  }
  function d(e) {
    return JSON.parse(localStorage.getItem(e) || "[]");
  }
  function u(e) {
    e && (e.classList.add("active"), e.classList.remove("cursor-pointer"));
  }
  function g(e, t, o) {
    const n = d(t);
    if (n.includes(e)) return;
    const s = new XMLHttpRequest();
    s.open("POST", "/apis/api.halo.run/v1alpha1/trackers/upvote"),
      (s.onload = () => {
        n.push(e), localStorage.setItem(t, JSON.stringify(n));
        const i = document.getElementById("upvote-number");
        if (i) {
          const c = parseInt(i.innerText);
          i.innerText = c + 1;
        }
        u(o);
      }),
      (s.onerror = () => {
        alert("网络请求失败，请稍后再试");
      }),
      s.setRequestHeader("Content-Type", "application/json"),
      s.send(
        JSON.stringify({ group: "content.halo.run", plural: "posts", name: e }),
      );
  }
  function v() {
    const e = document.getElementById("sponsor-button"),
      t = document.getElementById("sponsor-page");
    e.addEventListener("click", function () {
      const o = document.createElement("div");
      (o.className = "fixed top-0 left-0 w-full h-full z-9"),
        document.body.appendChild(o),
        t.classList.remove("hidden"),
        e.classList.add("active"),
        o.addEventListener("click", function () {
          document.body.removeChild(o),
            t.classList.add("hidden"),
            e.classList.remove("active");
        });
    });
  }
  function y() {
    document
      .querySelectorAll(
        `#post-content a[href^="https://"]:not([href*="${window.location.hostname}"])`,
      )
      .forEach((t) => {
        const o = {
            "github.com": "favicons/github.svg",
            "halo.run": "favicons/halo.webp",
          },
          n = new URL(t.href);
        let s = "";
        for (const [L, T] of Object.entries(o))
          if (n.hostname.includes(L)) {
            s = T;
            break;
          }
        const i = new URL(
            s,
            (l && l.tagName.toUpperCase() === "SCRIPT" && l.src) ||
              new URL("main.iife.js", document.baseURI).href,
          ),
          c = document.createElement("span");
        (c.style.display = "inline-block"),
          (c.style.width = "1rem"),
          (c.style.height = "1rem"),
          (c.style.marginRight = "0.2rem"),
          s
            ? ((c.style.backgroundImage = `url(${i})`),
              (c.style.backgroundSize = "contain"),
              (c.style.verticalAlign = "-0.1rem"))
            : (c.className =
                "icon-[pajamas--external-link] iconify-inline text-gray"),
          t.insertBefore(c, t.firstChild);
        const r = t.previousSibling;
        (r && r.nodeType === Node.TEXT_NODE && r.textContent.trim() === "") ||
          t.insertAdjacentText("beforebegin", " ");
      });
  }
  var E = function () {
    var e = document.getElementsByClassName("to-top")[0],
      t =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
    if (e) {
      t >= window.innerHeight / 2
        ? e.classList.add("active")
        : e.classList.remove("active");
    }
  };
  window.addEventListener("scroll", E),
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("a[href^='https://']").forEach((e) => {
        e.setAttribute("target", "_blank"), e.setAttribute("rel", "noopener");
      });
    });
  function b() {
    try {
      const postContent = document.querySelector("#post-content");
      const wordCountEl = document.getElementById("post-wordcount");
      const readTimeEl = document.getElementById("post-readtime");

      if (!postContent || !wordCountEl || !readTimeEl) {
        return;
      }

      const textContent = postContent.textContent || '';
      const wordCount = textContent.length;

      if (wordCountEl) {
        wordCountEl.textContent = wordCount.toString();
      }

      if (readTimeEl) {
        const fastRead = Math.round(wordCount / 350);
        const slowRead = Math.round(wordCount / 250);
        const readTime = fastRead === slowRead ? `${slowRead} min` : `${fastRead}~${slowRead} min`;
        readTimeEl.textContent = readTime;
      }
    } catch (error) {
      console.warn('Word count calculation failed:', error);
    }
  }
  function I(e, t) {
    const o = new Date(e),
      n = new Date(t),
      s = o.getTime(),
      i = n.getTime(),
      c = Math.abs(i - s);
    return Math.floor(c / (1e3 * 60 * 60 * 24));
  }
  function C() {
    try {
      const now = Date.now();
      const updateTimeEl = document.getElementById("post-update-time");
      const publishTimeEl = document.getElementById("post-publish-time");
      const timeTipsEl = document.getElementById("post-time-tips-span");

      if (!timeTipsEl) {
        return;
      }

      let timeText = "";
      let prefix = "";

      if (updateTimeEl && updateTimeEl.textContent) {
        timeText = updateTimeEl.textContent;
        prefix = "更新于 ";
      } else if (publishTimeEl && publishTimeEl.textContent) {
        timeText = publishTimeEl.textContent;
        prefix = "发布于 ";
      } else {
        return;
      }

      const phrases = [
        "时过境迁",
        "沧海桑田",
        "天翻地覆",
        "水流花落",
        "斗转星移",
        "物是人非",
        "时移世易",
        "物换星移",
        "春去秋来",
      ];

      const randomIndex = Math.floor(Math.random() * phrases.length);
      const daysDiff = I(timeText, now);

      timeTipsEl.textContent = `本文${prefix}${daysDiff} 天前，其中的信息可能已经${phrases[randomIndex]}`;
    } catch (error) {
      console.warn('Time tips generation failed:', error);
    }
  }
  // Console output with repository information
  function showRepoInfo() {
    const styles = [
      'color: #4f46e5',
      'font-size: 16px',
      'font-weight: bold',
      'text-shadow: 1px 1px 1px rgba(0,0,0,0.1)'
    ].join(';');

    const linkStyles = [
      'color: #059669',
      'font-size: 14px',
      'text-decoration: underline'
    ].join(';');

    console.log('%c🚀 Looks Blog - Powered by GitHub Issues', styles);
    console.log('%c📖 Documentation: https://github.com/Master08s/looks-blog', linkStyles);
    console.log('%c⭐ Give us a star if you like this project!', 'color: #f59e0b; font-size: 14px;');
    console.log('%c🛠️ Built with ❤️ by Master08s', 'color: #6b7280; font-size: 12px;');
  }

  // Show repository info when page loads
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showRepoInfo);
    } else {
      showRepoInfo();
    }
  }

  return (
    (a.addIconToLinks = y),
    (a.clickHighlightTOC = f),
    (a.generateTOC = m),
    (a.generateTimeTips = C),
    (a.scrollHighlightTOC = p),
    (a.sponsor = v),
    (a.upvote = h),
    (a.wordCountAndReadTime = b),
    Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }),
    a
  );
})({});
