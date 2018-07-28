import { Observable } from 'rxjs';


export default class ScrollToPlay {
  constructor({
    imageElementId,
    imageSrcs,
    preloadImagesOnLoad = true,
    showPreloadProgress = true,
    preloadProgressColor = '#dadada',
    autoplay = false,
    verbose = false,
  }) {
    this.imageEl = document.getElementById(imageElementId)
    if (!this.imageEl) {
      throw 'ScrollToPlay ERROR: no image element - did you set correct id?'
    }
    this.imageSrcs = Array.isArray(imageSrcs) && imageSrcs.length ? imageSrcs : []
    this.imagesPreload = []
    this.showPreloadProgress = showPreloadProgress
    this.progressBarElement = null
    this.progressBarColor = preloadProgressColor
    this.autoPlayInterval = null
    if (preloadImagesOnLoad) {
      this.preloadImages().subscribe(value => {
        if (verbose) { console.log(`ScrollToPlay [${imageElementId}]: preloaded ${(value * 100).toFixed(2)} %`) }
      }, err => {
        throw err
      }, () => {
        if (autoplay) {
          this.playAnimation();
        } else {
          this.showCurrentImage()
          this.updateImageOnScroll();
        }
      })
    }
  }

  /**
   * Call to preload images. Subscribe to percentual progress. You can call `updateImageOnScroll()` onComplete.
   * @returns {Observable<number>}
   */
  preloadImages() {
    if (this.showPreloadProgress && !this.progressBarElement) {
      this.initProgressBar(10)
    }
    return new Observable(observer => {
      this.imagesPreload = []
      const loadedImgs = []
      const totalImgsCount = this.imageSrcs.length
      let loadedImgsCount = 0
      this.imageSrcs.forEach(imgSrc => {
        const img = new Image()
        img.src = imgSrc
        loadedImgs.push(new Promise(r => {
          img.onload = ev => {
            loadedImgsCount++
            observer.next(loadedImgsCount / totalImgsCount)
            if (this.showPreloadProgress && this.progressBarElement) {
              this.setProgress(Math.round((loadedImgsCount / totalImgsCount) * 100))
            }
            r(ev)
          }
        }))
        this.imagesPreload.push(img)
      })
      Promise.all(loadedImgs).then(imgs => {
        if (this.showPreloadProgress && this.progressBarElement) {
          this.setProgress(0)
        }
        observer.complete()
      })
    });
  }

  /**
   * Call to start scroll listener. Better to have images preloaded first, especially with bigger ones.
   */
  updateImageOnScroll() {
    ScrollToPlay.listenForScroll(true).subscribe(val => {
      this.imageEl.src = this.imageSrcs[Math.round(ScrollToPlay.convertRange(val, [0, 1], [0, this.imageSrcs.length - 1]))]
    })
  }

  /**
   * Fill image based on current scroll position
   */
  showCurrentImage() {
    this.imageEl.src = this.imageSrcs[Math.round(ScrollToPlay.convertRange(ScrollToPlay.getScrollPercentage, [0, 1], [0, this.imageSrcs.length - 1]))]
  }

  /**
   * Fill image based on given key
   * @param imgKey {number}
   */
  showImage(imgKey) {
    this.imageEl.src = this.imageSrcs[imgKey]
  }

  /**
   * @param height {number}
   * @returns {HTMLElement}
   */
  initProgressBar(height) {
    this.progressBarElement = document.createElement('div')
    this.progressBarElement.id = `${this.imageEl.id}-progress`
    this.progressBarElement.style.width = '0%'
    this.progressBarElement.style.height = `${height}px`
    this.progressBarElement.style.backgroundColor = this.progressBarColor
    this.progressBarElement.style.position = 'relative'
    this.progressBarElement.style.bottom = `${height + 2}px`
    this.imageEl.closest('div').appendChild(this.progressBarElement)
    return this.progressBarElement
  }

  /**
   * @param percentage {number}
   */
  setProgress(percentage) {
    if (!this.progressBarElement) {
      throw 'ScrollToPlay ERROR: no ProgressBar, init one first!'
    }
    this.progressBarElement.style.width = `${percentage}%`
  }

  /**
   * Start loop 24fps
   */
  playAnimation() {
    let key = 0
    if (!this.autoPlayInterval) {
      this.autoPlayInterval = setInterval(() => {
        this.showImage(key)
        if (key < (this.imageSrcs.length - 1)) {
          key++
        } else {
          key = 0
        }
      }, 1000 / 24)
    }
  }

  /**
   * Stop loop
   */
  stopAnimation() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval)
      this.autoPlayInterval = null
    }
  }

  /**
   * @returns {number}
   */
  static get getMaxScrollHeight() {
    return document.body.offsetHeight - window.innerHeight
  }

  /**
   * @returns {number}
   */
  static get getScrollPosition() {
    return window.pageYOffset
  }

  /**
   * @returns {number}
   */
  static get getScrollPercentage() {
    return parseFloat(Math.min(ScrollToPlay.getScrollPosition / ScrollToPlay.getMaxScrollHeight, 1).toFixed(2))
  }

  /**
   * @param asPercentage {boolean}
   * @returns {Observable<number>}
   */
  static listenForScroll(asPercentage = false) {
    return new Observable(observer => {
      window.addEventListener('scroll', () => {
        observer.next(asPercentage ? ScrollToPlay.getScrollPercentage : ScrollToPlay.getScrollPosition)
      })
    })
  }

  /**
   * @param value {number}
   * @param r1 {Array<number>}
   * @param r2 {Array<number>}
   * @returns {number}
   */
  static convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0]
  }
}
