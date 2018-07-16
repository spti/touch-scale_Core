function ScaleCore() {

}

ScaleCore.prototype.calculateTransform = function(target, transforms, rects, parent) {

  // project, what rects of el would look like after it's scaled
  const rectsProjected = this.projectRects(target, transforms, rects)

  // adjust the el's translation to fit it in it's container nicely
  const transformsBounded = this.encounterBounds(transforms, rects, parent)

  return transformsBounded
}

ScaleCore.prototype.projectRects = function(target, rects, transforms) {

  // this.coordinates.rects = this.el.getBoundingClientRect();

  // figure out the dimensions for the element to obtain after scaling:
  var ratio = target / transforms.scaleX;

  // we make projection of the future scaled element...
  const rectsProjected = {
    left: (rects.left + rects.width / 2) - (transforms.originX * target),
    top: (rects.top + rects.height / 2) - (transforms.originY * target),
    width: rects.width * ratio,
    height: rects.height * ratio
  }

  return rectsProjected
}

ScaleCore.prototype.encounterBounds = function(transforms, rects, parent) {

  var array = [
    {
      length: rects.width,
      pos: rects.left,
      translation: transforms.translateX,
      parent: parent.width // parseInt(getViewportWidth())
    },
    {
      length: rects.height,
      pos: rects.top,
      translation: transforms.translateY,
      parent: parent.height // parseInt(getViewportHeight())
    }
  ]

  for (var i = 0; i < array.length; i++) {
    var temp = process(array[i]);
    // console.log("tweakIt", temp)
    array[i].newPos = (typeof(temp) === 'number') ? temp : array[i].translation;
  }

  const transformsNew = {}

  // Object.assign is es6, but there's a polyfill, in case of anything:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
  Object.assign(transformsNew, transforms)

  transformsNew.translateX = array[0].newPos;
  transformsNew.translateY = array[1].newPos;

  function process(axis) {

    if (axis.length <= axis.parent) {
      if (axis.pos > (axis.parent - axis.length)) {
        return ( axis.translation - (axis.pos - (axis.parent - axis.length)) );
      } else if (axis.pos < (0)) {
        return ( axis.translation + Math.abs(axis.pos) + 2 );
      }
      return false;
    } else if (axis.length > axis.parent) {
      if (axis.pos > (0)) {
        return ( axis.translation - axis.pos );
      } else if (axis.pos < (axis.parent - axis.length)) {
        return ( (axis.translation + ( Math.abs(axis.pos) - Math.abs(axis.parent - axis.length) )) );
      }
      return false;
    }
    return false;
  }

  return transformsNew;
  //this.element.css( 'transform', 'matrix(' + coords.scaleX + ', 0, 0, ' + coords.scaleY +  ', ' + x.newPos + ', ' + y.newPos + ')' );

}

ScaleCore.prototype.calculateTransform = function(transforms, rects, containerDims, target) {

  const transformsNew = {}
  Object.assign(transformsNew, transforms)

  // this.coordinates.rects = this.el.getBoundingClientRect();

  // figure out the dimensions for the element to obtain after scaling:
  var ratio = target / transforms.scaleX;

  // we make projection of the future scaled element...
  const transformsProjected = {
    rects: {
      left: (rects.left + rects.width / 2) - (transforms.originX * target),
      top: (rects.top + rects.height / 2) - (transforms.originY * target),
      width: rects.width * ratio,
      height: rects.height * ratio
    },
    // if we'd work with changing origin, these values in transforms would be altered by scaleStart.
    // in our case, however, these remain the same as they were left after the previous scaling of the element.
    translateX: transforms.translateX,
    translateY: transforms.translateY
  }

  // ... to see, if it would overflow the borders of the viewport, and, if so,
  // adjust the translation to avoid that
  var transformsBounded = this.encounterBounds(transformsProjected, containerDims);

  // set the values that the matrix of the element should have
  transformsNew.translateX = transformsBounded.translateX
  transformsNew.translateY = transformsBounded.translateY
  transformsNew.scaleX = target
  transformsNew.scaleY = target

  return transformsNew
}

export {ScaleCore}

/*
const ScaleCore = {
  expose: function() {
    return ScaleCoreCapsule()
  }
}

// export {ScaleCoreCapsule}
*/
