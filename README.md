# ScrollToPlay
#### animate images on scroll

## Installation

run `npm i scroll-to-play` or `yarn add scroll-to-play`

## Usage

* import library:
```ecmascript 6
import ScrollToPlay from '../scroll-to-play/scroll-to-play'
```

* create array with image urls:
```ecmascript 6
const images = [
  'path/to/image1.jpg',
  'path/to/image2.jpg',
  // ...
  'path/to/imageX.jpg',
]
```

* create `img` and initialize ScrollToPlay with its id:
```ecmascript 6
// <div><img id="image-animated"></div>
// ...
const stp = new ScrollToPlay({
  imageElementId: 'image-animated',
  imageSrcs: images,
})
```
this is minimal configuration. other possible options are:
```ecmascript 6
{
  imageElementId: 'image-animated',
  imageSrcs: images,
  // optional with defaults:
  preloadImagesOnLoad: true,
  showPreloadProgress: true,
  preloadProgressColor: '#dadada',
  fromPx: 0,
  fromPercent: 0,
  toPx: 0,
  toPercent: 1,
  autoplay: false,
  verbose: false,
}
```
