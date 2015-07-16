#  <img src="https://avatars3.githubusercontent.com/u/12140183" width="26" height="26"> Embedded Bible Audio Player

[![MIT License](https://img.shields.io/github/license/TalkingBibles/react-readalong-component.svg)](LICENSE)
[![Dependencies](https://david-dm.org/TalkingBibles/react-readalong-component.svg)](https://david-dm.org/TalkingBibles/react-readalong-component)


An embeddable Javascript that plays audio from the Talking Bibles API

## Demo & Examples

To build the examples locally, run:

```
npm install
npm build
npm serve
```

Then open [`localhost:8000`](http://localhost:8000) in a browser.


## Installation and Usage

**There is no easy way to use the embeddable player at the moment, as the API is
undocumented and in flux. But watch this project for future updates!**

First, include the file asynchronously in the `head` of your page.

```html
  <script src="{path to the file}/tbplayer.min.js" async></script>
```

Then, in the place where you want the player to appear, place a `div` with the
`data-location` attribute. This should contain the version, book, and chapter
that you want to display in the format `{version}:{book}:{chapter}`.

```html
<div class="tbplayer" data-location="ahk:02_mark:1"></div>
```
The first two components correspond to Talking Bibles' internal designator. The
last is a **zero-indexed** reference to the chapter's position. It is not an id.
This position does not take into account the fact that some of Talking Bibles'
recordings are missing chapters. For example, imagine a book with 10 chapters,
but our archive is missing chapter 7. If you ask for chapter 6, you will
actually get chapter 8. If you ask for chapter 9, you get nothing. It's not a
perfect system...

## Compatibility

This component is fairly compatible across modern browsers. If it can't play,
it fails gracefully.


## License

See the [LICENSE](LICENSE).
