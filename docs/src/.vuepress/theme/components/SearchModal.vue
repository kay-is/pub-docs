<template>
  <div class="search-modal" ref="modalOuter">
    <div class="search-modal-content" ref="modalProper">
      <input
        ref="input"
        aria-label="Search"
        :value="query"
        :class="{ focused: focused }"
        :placeholder="searchPlaceholder"
        autocomplete="off"
        spellcheck="false"
        @input="query = $event.target.value"
        @focus="onInputFocus"
        @blur="onInputBlur"
        @keydown.up.prevent="onUp"
        @keydown.down.prevent="onDown"
        @keydown.enter.prevent="go(focusIndex)"
      />
      <ul
        class="suggestions"
        :class="{ 'align-right': alignRight }"
        @mouseleave="unfocus"
      >
        <li
          v-for="(s, i) in suggestions"
          :key="i"
          class="suggestion"
          :class="{ focused: i === focusIndex }"
          @mousedown="go(i)"
          @mouseenter="focus(i)"
        >
          <a :href="s.path" @click.prevent>
            <span class="page-title">{{ s.title || s.path }}</span>
            <span v-if="s.header" class="header">&gt; {{ s.header }}</span>
            <span
              v-if="s.contentStr && s.contentHighlight"
              class="content-snippet"
              v-html="highlightSnippet(s)"
            ></span>
          </a>
        </li>
      </ul>
      <button @click="$emit('close-modal')">Close</button>
    </div>
  </div>
</template>

<script>
// import matchQuery from "./search-dependencies/match-query";
import flexsearchSvc from "./search-dependencies/flexsearchSvc";

/* global SEARCH_MAX_SUGGESTIONS, SEARCH_PATHS, SEARCH_HOTKEYS */
export default {
  name: "SearchModal",

  data() {
    return {
      query: "",
      focused: false,
      focusIndex: 0,
      suggestions: [],
    };
  },

  computed: {
    searchPlaceholder() {
      return this.$site.themeConfig.searchPlaceholder || "";
    },

    isModalOpen() {
    return this.$store.state.isSearchModalOpen;
  },

    showSuggestions() {
      return this.focused && this.suggestions && this.suggestions.length;
    },

    // suggestions() {
    //   const query = this.query.trim().toLowerCase();
    //   if (!query) {
    //     return;
    //   }

    //   const { pages } = this.$site;
    //   const max =
    //     this.$site.themeConfig.searchMaxSuggestions || SEARCH_MAX_SUGGESTIONS;
    //   const localePath = this.$localePath;
    //   const res = [];
    //   for (let i = 0; i < pages.length; i++) {
    //     if (res.length >= max) break;
    //     const p = pages[i];
    //     // filter out results that do not match current locale
    //     if (this.getPageLocalePath(p) !== localePath) {
    //       continue;
    //     }

    //     // filter out results that do not match searchable paths
    //     if (!this.isSearchable(p)) {
    //       continue;
    //     }

    //     if (matchQuery(query, p)) {
    //       res.push(p);
    //     } else if (p.headers) {
    //       for (let j = 0; j < p.headers.length; j++) {
    //         if (res.length >= max) break;
    //         const h = p.headers[j];
    //         if (h.title && matchQuery(query, p, h.title)) {
    //           res.push(
    //             Object.assign({}, p, {
    //               path: p.path + "#" + h.slug,
    //               header: h,
    //             })
    //           );
    //         }
    //       }
    //     }
    //   }
    //   return res;
    // },



    // make suggestions align right when there are not enough items
    
    alignRight() {
      const navCount = (this.$site.themeConfig.nav || []).length;
      const repo = this.$site.repo ? 1 : 0;
      return navCount + repo <= 2;
    },
  },

  mounted() {
    this.placeholder = this.$site.themeConfig.searchPlaceholder || "";
    document.addEventListener("keydown", this.onHotkey);
    document.addEventListener("keydown", this.onEscapeKey);
    this.$refs.input.focus();
    document.addEventListener("click", this.handleDocumentClick);
  },

  beforeDestroy() {
    document.removeEventListener("keydown", this.onHotkey);
    document.removeEventListener("click", this.handleDocumentClick);
    document.removeEventListener("keydown", this.onEscapeKey);
  },

  watch: {
    async query(newQuery) {
      if (newQuery.length >= 2) {
        await this.fetchSuggestions();
      } else {
        this.suggestions = [];
      }
    },
  },

  methods: {

    highlightSnippet(s) {
      // console.log(s.contentStr)
      const start = s.contentHighlight[0];
      const end = start + s.contentHighlight[1];
      const before = s.contentStr.slice(0, start);
      const match = s.contentStr.slice(start, end);
      const after = s.contentStr.slice(end);

      return `${before}<span class="highlight">${match}</span>${after}`;
    },

    async fetchSuggestions() {
      const query = this.query.trim().toLowerCase();
      if (!query) {
        this.suggestions = [];
        return;
      }

      const results = await flexsearchSvc.match(query, query.split(/\s+/));
      // console.log(results)
      this.suggestions = results.map((result) => {
        return {
          title: result.title,
          path: result.path + result.slug,
          header: result.headingStr,
          contentStr: result.contentStr,
          contentHighlight: result.contentHighlight
        };
      });
    },

    onEscapeKey(event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        this.$store.commit("closeSearchModal");
      }
    },

    handleDocumentClick(event) {
      const modalOuter = this.$refs.modalOuter;
      const modalProper = this.$refs.modalProper;
      if ( modalOuter &&
        modalOuter.contains(event.target) &&
        !modalProper.contains(event.target)
      ) {
        this.$store.commit("closeSearchModal");
      }
    },

    onInputFocus() {
      this.focused = true;
    },

    onInputBlur() {
      // Delay the blur event to allow clicking on suggestions
      setTimeout(() => {
        this.focused = false;
      }, 200);
    },
    openModal() {
      this.$store.commit("openSearchModal");
    },

    getPageLocalePath(page) {
      for (const localePath in this.$site.locales || {}) {
        if (localePath !== "/" && page.path.indexOf(localePath) === 0) {
          return localePath;
        }
      }
      return "/";
    },

    isSearchable(page) {
      let searchPaths = SEARCH_PATHS;

      // all paths searchable
      if (searchPaths === null) {
        return true;
      }

      searchPaths = Array.isArray(searchPaths)
        ? searchPaths
        : new Array(searchPaths);

      return (
        searchPaths.filter((path) => {
          return page.path.match(path);
        }).length > 0
      );
    },

    onHotkey(event) {
      if (
        event.srcElement === document.body &&
        SEARCH_HOTKEYS.includes(event.key)
      ) {
        this.$refs.input.focus();
        event.preventDefault();
      }
    },

    onUp() {
      if (this.focusIndex > 0) {
        this.focusIndex--;
      } else {
        this.focusIndex = this.suggestions.length - 1;
      }
    },

    onDown() {
      this.focusIndex = (this.focusIndex + 1) % this.suggestions.length;
    },

    go(i) {
      if (!this.showSuggestions) {
        return;
      }
      this.$router.push(this.suggestions[i].path);
      this.query = "";
      this.focusIndex = 0;
      this.$store.commit("closeSearchModal");
    },

    focus(i) {
      this.focusIndex = i;
    },

    unfocus() {
      this.focusIndex = -1;
    },
  },
};
</script>

<style lang="stylus">
input:focus
  outline-offset none
  border 2px solid var(--AccentColor) !important
  outline none

.search-modal-content .content-snippet
  display: block
  margin-top: 0.5em
  white-space: pre-wrap
  color: var(--TextColor)

.highlight
  text-decoration: underline
  color: var(--AccentColor)


.suggestion:hover
  color: var(--AccentColor) 
  a 
    color: var(--AccentColor) 
    span:not(.content-snippet)
      color: var(--AccentColor) 
    .content-snippet
       color: var(--TextColor) !important


.search-modal
  position fixed
  top 0
  left 0
  width 100%
  height 100%
  display flex
  justify-content center
  align-items center
  z-index 100
  background-color rgba(0, 0, 0, 0.5)

.search-modal-content
  position relative
  width 60vw
  height 60vh
  background-color var(--BgColor1) !important
  color var(--TextColor)
  border-radius 10px
  box-shadow 0 2px 10px rgba(0, 0, 0, 0.1)
  padding 20px
  overflow-x hidden
  display flex
  flex-direction column
  align-items center
  border 2px solid var(--BorderColor)

.search-modal-content input
  width 80%
  padding 10px
  border-radius 5px
  margin-bottom 20px
  margin-top 1rem
  border 2px solid var(--BorderColor)
  &:focus, &:active, &:hover, &:select, .focused
    border 2px solid var(--AccentColor) !important

.search-modal-content ul
  background-color var(--BgColor1)
  list-style-type none
  padding 0
  min-width 80%

.search-modal-content li
  padding 10px
  border-bottom 1px solid var(--BorderColor)
  color var(--TextColor) !important
  a
    color var(--TextColor)
  &.focused, .focused:focus
    background-color var(--LineColor)
    border 1px solid var(--AccentColor) !important
    cursor pointer

.search-modal-content li:last-child
  border-bottom none

.search-modal-content button
  position sticky
  bottom 20px
  right 5px
  align-self flex-end
  margin-top 20px
  padding 10px 20px
  background-color var(--LineColor)
  color var(--TextColor)
  border none
  border-radius 5px
  cursor pointer
  &:hover
    background-color var(--AccentColor)
</style>
