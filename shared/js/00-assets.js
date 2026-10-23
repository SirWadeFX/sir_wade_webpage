/* ==========================================================================
   00 — ASSET RESOLVER

   WHY THIS EXISTS
   The markup never hardcodes a media URL. Instead every image, video, poster
   and link carries a dotted key:

     <img  data-sw-src="catalog.basics">
     <video data-sw-src="home.rift" data-sw-poster="home.poster"></video>
     <div  data-sw-bg="bio.portrait"></div>
     <a    data-sw-href="links.signup">

   The key resolves against DEFAULTS below, overridden by anything you put in
   `window.SW_ASSETS` from a Kajabi head snippet. That means you can point any
   asset at a file in your Kajabi library without touching this repo — and a
   GIF, an MP4 and a JPEG are all swappable at the same key.

   Resolution order:  window.SW_ASSETS  →  DEFAULTS  →  leave element as-is

   Anything unresolved keeps whatever is already in the markup, so a plain
   `<img src="...">` with no data-attribute still works.
   ========================================================================== */

(function () {
  "use strict";

  /* Class Info placeholders, served from this repo's assets/class-info/.
     Each is cut from Class Info Page_V2.png (see that page's CSS), so swap
     in the real renders from the head snippet when they exist.
     SW_REPO_BASE lets a local preview read them from the working tree
     before they're released; build.mjs sets it. Live pages never do. */
  var REPO =
    window.SW_REPO_BASE ||
    "https://cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@v1.13.4/";
  var CI = REPO + "assets/class-info/";
  var CL = REPO + "assets/class-library/";
  var MOD = REPO + "assets/mentorship-open-door/";

  /* Shipped defaults — the Kajabi CDN URLs currently in use.
     Override individual keys from Kajabi; you never need to fork this. */
  var DEFAULTS = {
    brand: {
      logoGreen:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/56088e3-c0ac-7e0-0247-3486f4022acd_Sir_Wade_-_Secondary_LogoArtboard_6_4.png",
      logoCream:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/56088e3-c0ac-7e0-0247-3486f4022acd_Sir_Wade_-_Secondary_LogoArtboard_6_4.png",
    },



    /* Class Library — the banner behind "CLASS LIBRARY" and one thumbnail
       per card, served from assets/class-library/. Each card image is the
       class's artwork cropped to the card's 16:9. acting and techAnim have
       no new artwork yet and keep their old images. */
    catalog: {
      /* burgerBoy.jpg (left) and the Open-Door robot render (right),
         blended to match the mockup — see 20-banner.css. Shipped
         undarkened — the page's CSS adds the scrim. */
      banner: CL + "banner.webp",
      basics: CL + "basics.webp", // AnimBasics-Promo.png
      mayaEssentials: CL + "maya-essentials.webp", // burgerBoy.jpg
      mayaForAnimators: CL + "maya-for-animators.webp", // arcade2.png
      bodyMechanics: CL + "body-mechanics.webp", // firekids.png
      advancedBodyMechanics: CL + "advanced-body-mechanics.webp", // mechanicscolorshift.png
      acting:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/site/2147638896/images/11aa03e-0e1f-0de6-c866-a0b747d3142_73f4cd17-0ddd-43ae-81ce-c5a401f84924.jpg",
      unrealIntro: CL + "unreal-intro.webp", // controlrig-edit.png
      unrealSeries: CL + "unreal-series.webp", // constraints.jpg
      unrealCinematics: CL + "unreal-cinematics.webp", // UE-Robot1.png
      techAnim: REPO + "assets/class-techanim.webp", // cut from Homepage_V2.png
      blender: CL + "blender.webp", // Blender.png
      mocap: CL + "mocap.webp", // mocap2.png
    },

    /* Mentorship One-Shots banner: rtx5090_cafe_frame.png (the same render
       as the home One-Shots card, uncropped), in assets/mentorship-one-shots/. */
    oneShots: {
      hero: REPO + "assets/mentorship-one-shots/hero.webp",
    },

    /* Open-Door Mentorship page — every default lives in
       assets/mentorship-open-door/. hero is RobotImage.jpg; the four
       backgrounds are the "OpenDoor Mentorship_*_Background.png" exports
       (How it works and Need more structure flattened onto black, the
       colour of the bands around them). The icons are the mockup's line
       drawings as white PNGs. works.w1–w4 are the Student Works frames:
       empty shows the mockup's blank frame. */
    mentorship: {
      hero: MOD + "robot.webp", // RobotImage.jpg
      whyBg: MOD + "why-bg.webp",
      howBg: MOD + "how-bg.webp",
      structureBg: MOD + "structure-bg.webp",
      signupBg: MOD + "signup-bg.webp",
      iconBeginner: MOD + "icon-beginner.png",
      iconStudent: MOD + "icon-student.png",
      iconJunior: MOD + "icon-junior.png",
      works: { w1: "", w2: "", w3: "", w4: "" },
    },

    /* Class Info — Animation in Unreal Engine. Speaker portraits and
       student works ship empty: an empty key shows the mockup's grey
       placeholder (avatar silhouette, blank frame) instead. */
    /* Home page. rift = _MainSequence.0679.jpg cropped to what the banner
       shows; classesBg = Hompage_Classes_Background.png; the mentorship
       cards are RobotImage.jpg and rtx5090_cafe_frame.png. */
    home: {
      rift: REPO + "assets/home/rift.webp",
      classesBg: REPO + "assets/home/classes-bg.webp",
      openDoor: REPO + "assets/home/open-door.webp", // RobotImage.jpg — its own copy of the Mentorship hero
      oneShots: REPO + "assets/home/cafe.webp",
      /* Cut from the mockup (716px circle) — the photo it shows. Swap for
         the original photo when there is one. */
      portrait: REPO + "assets/home/portrait.webp",
    },

    classInfo: {
      hero: CI + "hero.webp",
      syllabusBg: CI + "syllabus-bg.webp",
      pricingBg: CI + "pricing-bg.webp",
      faqBg: CI + "faq-bg.webp",
      overview: {
        levelSequences: CI + "levelSequences.webp",
        animSequences: CI + "animSequences.webp",
        shotSetup: CI + "shotSetup.webp",
        controlRig: CI + "controlRig.webp",
        curveEditor: CI + "curveEditor.webp",
        constraints: CI + "constraints.webp",
        mayaToUnreal: CI + "mayaToUnreal.webp",
        mocap: CI + "mocap.webp",
        animBlueprint: CI + "animBlueprint.webp",
      },
      speakers: { s1: "", s2: "", s3: "" },
      works: { w1: "", w2: "", w3: "", w4: "" },
    },


    /* Live Mocap Workshop (pages/mocap-workshop). Reuses Class Info's
       renders until the workshop has its own; swap from the head snippet. */
    mocapWorkshop: {
      hero: CI + "hero.webp",
      detailsBg: CI + "syllabus-bg.webp",
      pricingBg: CI + "pricing-bg.webp",
      faqBg: CI + "faq-bg.webp",
      learn: {
        capture: CL + "unreal-cinematics.webp",
        retarget: CI + "mocap.webp",
        cleanup: CI + "animSequences.webp",
        layers: CI + "controlRig.webp",
        polish: CI + "curveEditor.webp",
        shot: CI + "levelSequences.webp",
      },
      instructors: { i1: "", i2: "" },
    },

    /* LightBox Expo landing page (pages/lbx). Partner logos ship empty:
       an empty logo shows the partner's name in its place. */
    lbx: {
      hero: REPO + "assets/home/rift.webp",
      workshop: CL + "mocap.webp",
      partners: { p1: "", p2: "", p3: "", p4: "" },
    },

    bio: {
      portrait:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/sites/2147638896/images/4a11cb-f6e-77ab-31d-85630f7caf5d_SW-ProfilePic2022.jpg",
    },

    avatars: {
      ariana:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/110d0c-dfae-0eb1-fc77-80b748e13c0a_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      carlos:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/5421801-c783-0e66-4ee0-cfa0f72a468c_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      charlotte:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/57a32c3-220-a5e3-6c08-5cf1b6b78a_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
      sarthak:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/43216d-6620-e345-2ddb-52ee210aba0b_3ec6c010-1f22-4850-a528-391f6a79da09.png",
      amanda:
        "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152768745/settings_images/72b0f-f310-e42d-ebfb-2fe43c826b0_2ff1a14b-0aac-42a1-a838-912000cbeccd.png",
    },


    /* Where the "Stay in the loop" form posts. Empty until it's wired: paste
       the action URL of a Kajabi form here (Marketing → Forms → the form →
       its embed code, the <form action="…">). Fields go as Kajabi's
       form_submission[name] and form_submission[email]. While it's empty
       the form still validates and says "You're signed up!", but nothing
       is stored. */
    forms: {
      newsletter: "",
    },

    links: {
      signup: "https://courses.sirwade.com/store",
      login: "https://courses.sirwade.com/login",
      courses: "https://sirwade.mykajabi.com/class-library-page-2",
      mentorship: "https://courses.sirwade.com/mentorship-page",
      tutorials: "https://www.youtube.com/@SirWade",
      waitlist: "https://bit.ly/b3dworkshoplist",
      about: "https://courses.sirwade.com/about",
      summerCamp: "https://courses.sirwade.com/animation-summer-camp",
      unreal: "https://courses.sirwade.com/unrealsummer",
      maya: "https://courses.sirwade.com/maya-for-animators-2023",
      basics: "https://courses.sirwade.com/animation-basics",

      /* Open-Door Mentorship "Sign up" buttons (the price card and the
         closing band). */
      mentorshipSignup: "https://courses.sirwade.com/store",
      /* Open-Door Mentorship "Learn more about Mentorship One-Shots" →
         the Mentorship One-Shots page. */
      oneShots: "https://sirwade.mykajabi.com/oneshots-page",

      /* Class Library cards without a known page yet fall back to the
         store. Point each at its Class Info page once it exists. */
      mayaEssentials: "https://courses.sirwade.com/store",
      bodyMechanics: "https://courses.sirwade.com/store",
      advancedBodyMechanics: "https://courses.sirwade.com/store",
      acting: "https://courses.sirwade.com/store",
      unrealIntro: "https://courses.sirwade.com/store",
      unrealSeries: "https://courses.sirwade.com/store",
      unrealCinematics: "https://courses.sirwade.com/store",
      techAnim: "https://courses.sirwade.com/store",

      /* Class Library card image + "Sign up" button, keyed like `catalog.*`.
         Each is the class's product page, taken from the old library pages
         (legacy/classPage*.html), newest edition where there are several. */
      classSignup: {
        basics: "https://courses.sirwade.com/products/animation-basics-fundamentals",
        mayaEssentials: "https://courses.sirwade.com/products/maya-animation-essentials",
        mayaForAnimators: "https://courses.sirwade.com/products/maya-for-animators-2027",
        bodyMechanics: "https://courses.sirwade.com/products/intro-to-body-mechanics",
        /* "Advanced Body Mechanics - Class 1 Official" */
        advancedBodyMechanics: "https://courses.sirwade.com/products/8b76116c-4d1d-4ec8-a353-ed43c2b8afb3",
        /* "Acting + Performance - Class 2" */
        acting: "https://courses.sirwade.com/products/4e2d4f1a-5d31-49f4-83a0-9af6cfde9158",
        unrealIntro: "https://courses.sirwade.com/products/intro-to-unreal-engine-5-8",
        /* "How to Animate in Unreal Engine 5.8 - Unreal Animation 5.8" */
        unrealSeries: "https://courses.sirwade.com/products/b92d580b-7406-4904-9d61-f5a2e9b4673f",
        /* "Creating Animated Cinematics in Unreal 5.8" */
        unrealCinematics: "https://courses.sirwade.com/products/e7f765dc-9f2b-41d3-8e7a-79624f23c26f",
        techAnim: "https://courses.sirwade.com/products/technical-animation-skills-workshop-2025",
      },

      /* Header "Classes" dropdown. Each class type goes to the Class Library
         until it has a page of its own. */
      classesMenu: {
        animation: "https://sirwade.mykajabi.com/class-library-page-2",
        maya: "https://sirwade.mykajabi.com/class-library-page-2",
        all: "https://sirwade.mykajabi.com/class-library-page-2",
        unreal: "https://sirwade.mykajabi.com/class-library-page-2",
      },
      /* Phone header menu: "LBX 2026" → the LightBox Expo landing page
         (the URL on the booth QR codes). */
      lbx: "https://courses.sirwade.com/lbx26-welcome",

      /* Mentorship pages (the URLs on the booth QR codes). */
      dailies: "https://courses.sirwade.com/mentorship-dailies",
      shotSprint: "https://courses.sirwade.com/mentorship-sprint",

      /* Live Mocap Workshop: its page (QR code URL) and its sign-up
         buttons, which fall back to the store until each has a checkout. */
      mocapWorkshop: {
        page: "https://courses.sirwade.com/mocap-workshop",
        signup: "https://courses.sirwade.com/store",
        seat: "https://courses.sirwade.com/store",
        bundleUnreal: "https://courses.sirwade.com/store",
        bundleSprint: "https://courses.sirwade.com/store",
        groups: "mailto:me@sirwade.com",
      },

      /* LBX page: the Animation Afterparty card's RSVP button. */
      lbxAfterparty: "#",

      /* LBX page: each partner card's "Claim offer" button. */
      lbxPartners: { p1: "#", p2: "#", p3: "#", p4: "#" },
      /* Header "Mentorship" dropdown. */
      mentorshipMenu: {
        personal: "https://sirwade.mykajabi.com/mentorship-page",
        shotSprint: "https://sirwade.mykajabi.com/oneshots-page",
      },

      /* "< Back to Class Library" on Class Info → the Class Library page. */
      catalog: "https://sirwade.mykajabi.com/class-library-page-2",

      /* Class Info sign-up buttons. All fall back to the store until each
         offer has its own checkout. */
      classInfo: {
        signup: "https://courses.sirwade.com/store",
        class01: "https://courses.sirwade.com/store",
        class02: "https://courses.sirwade.com/store",
        bundle: "https://courses.sirwade.com/store",
        bulk: "https://courses.sirwade.com/store",
      },
    },
  };

  /* Deep-merge user overrides over the defaults. Objects merge key by key so
     `SW_ASSETS = { home: { rift: "..." } }` keeps every other home key. */
  function merge(base, over) {
    var out = {},
      k;
    for (k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    for (k in over) {
      if (!Object.prototype.hasOwnProperty.call(over, k)) continue;
      var bv = out[k],
        ov = over[k];
      var bothPlain =
        bv &&
        ov &&
        typeof bv === "object" &&
        typeof ov === "object" &&
        !Array.isArray(bv) &&
        !Array.isArray(ov);
      out[k] = bothPlain ? merge(bv, ov) : ov;
    }
    return out;
  }

  var assets = merge(DEFAULTS, window.SW_ASSETS || {});


  /* "catalog.basics" → assets.catalog.basics */
  function get(path) {
    if (!path) return "";
    var parts = String(path).split("."),
      node = assets;
    for (var i = 0; i < parts.length; i++) {
      if (node == null || typeof node !== "object") return "";
      node = node[parts[i]];
    }
    return typeof node === "string" ? node : "";
  }

  var VIDEO_RE = /\.(mp4|webm|ogv|mov)(\?|#|$)/i;

  function applyTo(root) {
    var scope = root || document;

    /* src — handles <img>, <video>, <source>, <iframe>.
       A video URL landing on an <img> is upgraded to a muted autoplay
       <video> in place, so one key can hold either a GIF or an MP4. */
    each(scope, "[data-sw-src]", function (el) {
      var url = get(el.getAttribute("data-sw-src"));
      if (!url) return;

      if (el.tagName === "IMG" && VIDEO_RE.test(url)) {
        el.parentNode.replaceChild(buildVideo(el, url), el);
        return;
      }
      if (el.tagName === "VIDEO" && !VIDEO_RE.test(url)) {
        el.parentNode.replaceChild(buildImage(el, url), el);
        return;
      }
      el.setAttribute("src", url);
    });

    each(scope, "[data-sw-poster]", function (el) {
      var url = get(el.getAttribute("data-sw-poster"));
      if (url) el.setAttribute("poster", url);
    });

    each(scope, "[data-sw-bg]", function (el) {
      var url = get(el.getAttribute("data-sw-bg"));
      if (url) el.style.backgroundImage = 'url("' + url + '")';
    });

    each(scope, "[data-sw-href]", function (el) {
      var url = get(el.getAttribute("data-sw-href"));
      if (url) el.setAttribute("href", url);
    });

    /* YouTube shorthand. One key drives both the link and the thumbnail:
         <a data-sw-yt="tutorials.t1"><img alt=""></a>
       The value can be a bare id, a watch/youtu.be/embed URL, or a plain
       image URL (in which case only the <img> is filled and the href is
       left alone). */
    each(scope, "[data-sw-yt]", function (el) {
      var value = get(el.getAttribute("data-sw-yt"));
      if (!value) return;

      var img = el.tagName === "IMG" ? el : el.querySelector("img");
      var id = youtubeId(value);

      if (id) {
        if (el.tagName === "A") {
          el.setAttribute("href", "https://www.youtube.com/watch?v=" + id);
        }
        if (img) {
          img.onerror = function () {
            img.onerror = null;
            img.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
          };
          img.setAttribute("src", ytThumb(id));
        }
      } else if (img) {
        img.setAttribute("src", value);
      }
      el.classList.add("has-media");
    });

    /* Any media that failed to resolve AND has no usable src shows the
       section's fallback panel instead of a broken-image icon. */
    each(scope, "[data-sw-fallback]", function (el) {
      var target = el.previousElementSibling;
      var live = target && (target.getAttribute("src") || "").length > 0;
      el.style.display = live ? "none" : "";
    });
  }

  /* Accepts "dQw4w9WgXcQ", "https://youtu.be/ID", "…/watch?v=ID",
     "…/embed/ID" and "…/shorts/ID". Returns null for anything else. */
  function youtubeId(value) {
    var v = String(value).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    var m = v.match(
      /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/,
    );
    return m ? m[1] : null;
  }

  /* maxresdefault doesn't exist for every upload; hqdefault always does.
     Fall back on error rather than leaving a broken thumbnail. */
  function ytThumb(id) {
    return "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
  }

  function each(scope, sel, fn) {
    var nodes = scope.querySelectorAll(sel);
    for (var i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function carryAttrs(from, to) {
    for (var i = 0; i < from.attributes.length; i++) {
      var a = from.attributes[i];
      if (a.name === "src" || a.name === "poster") continue;
      to.setAttribute(a.name, a.value);
    }
  }

  function buildVideo(from, url) {
    var v = document.createElement("video");
    carryAttrs(from, v);
    v.autoplay = v.muted = v.loop = v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    var poster = get(from.getAttribute("data-sw-poster"));
    if (poster) v.setAttribute("poster", poster);
    v.src = url;
    return v;
  }

  function buildImage(from, url) {
    var img = document.createElement("img");
    carryAttrs(from, img);
    img.src = url;
    return img;
  }

  /* Kajabi renders each custom code block separately and some sections can
     mount after this script runs, so re-apply on DOM additions as well. */
  function boot() {
    applyTo(document);
    if (!window.MutationObserver) return;
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        applyTo(document);
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* Exposed so you can re-resolve after injecting markup yourself:
       SWAssets.apply();            // re-scan the page
       SWAssets.get("links.login"); // read a resolved value */
  window.SWAssets = { apply: applyTo, get: get, all: assets };
})();
