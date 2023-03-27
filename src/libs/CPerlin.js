/* global MOD3 */
!(function (MOD3) {
  "use strict";

  console.log("hi");
  /**
   * MOD3  Perlin/Simplex Noise Modifier
   **/

  /**[DOC_MD]
 * ### Perlin modifier
 *
 *  Displaces vertices based on a perlin/simplex noise source.
 *
 *  Accepts a perlin/simplex noise data (with width and height information) and displaces vertices
 *  based on the value of each point of the noise map.
 *
 *  @author Bartek Drozdz
 *
 *  @uses: https://github.com/josephg/noisejs for JavaScript
 *
[/DOC_MD]**/
  function cyclic_shift(a, w, h, dX, dY) {
    var size = w * h,
      b = new MOD3.VecArray(size),
      i,
      j,
      i2,
      j2,
      index;
    if (dX < 0) dX += w;
    if (dY < 0) dY += h;
    dX = ~~dX;
    dY = ~~dY;
    for (i = 0, j = 0, index = 0; index < size; ++index, ++i) {
      if (i >= w) {
        i = 0;
        ++j;
      }
      i2 = (i + dX) % w;
      j2 = (j + dY) % h;
      b[index] = a[i2 + j2 * w];
    }
    return b;
  }
  /*function generate2d(perlinNoise2d, w, h)
{
    var size = w*h, a = new MOD3.VecArray(size), i, j, index;
    for (i=0,j=0,index=0; index<size; ++index,++i)
    {
        if (i >= w) {i = 0; ++j;}
        a[index] = perlinNoise2d(i/w, j/h);
    }
    return a;
}*/
  MOD3.CPerlin = MOD3.Class(MOD3.Modifier, {
    constructor: function CPerlin(force, noise, autoRun) {
      var self = this;
      if (!(self instanceof CPerlin)) return new Perlin(force, noise, autoRun);
      self.$super("constructor");
      self.name = "CPerlin";
      self.delta = 0;
      self.force = null != force ? force : 1;
      self.perlin = noise;
      self.autoRun = null != autoRun ? !!autoRun : true;
      self.axes = MOD3.ModConstant.X | MOD3.ModConstant.Y | MOD3.ModConstant.Z;
    },

    delta: 0,
    speedX: 1,
    speedY: 1,
    perlin: null,
    force: 1,
    offset: 0,
    autoRun: true,

    dispose: function () {
      var self = this;
      self.delta = null;
      self.perlin = null;
      self.speedX = null;
      self.speedY = null;
      self.force = null;
      self.offset = null;
      self.autoRun = null;
      self.$super("dispose");

      return self;
    },

    setSpeed: function (dX, dY) {
      var self = this;
      self.speedX = dX;
      self.speedY = dY;
      return self;
    },

    apply: function (modifiable) {
      var self = this,
        axes = self.axes,
        force = self.force,
        offset = self.offset,
        pn = self.perlin,
        delta = self.delta,
        w,
        h;

      if (!axes || !pn) return self;
      w = pn.width;
      h = pn.height;
      if (self.autoRun) {
        delta = self.delta += 0.05;
        pn = self.perlin = cyclic_shift(pn, w, h, self.speedX, self.speedY);
        pn.width = w;
        pn.height = h;
      }

      MOD3.List.each(modifiable.vertices, function (v) {
        var xyz = v.getXYZ(),
          uu = ~~(((w - 1) * v.ratio[0]) /* u */),
          vv = ~~(((h - 1) * v.ratio[2]) /* v */),
          uv = uu + vv * w;

        /*
        let x = xyz[0] + (pn[uv] - offset) * force;
        let y = xyz[1] + (pn[uv] - offset) * force;
        let z = xyz[2]; // + (pn[uv] - offset) * force;
        */

        let x = xyz[0] + (Math.sin(delta + xyz[2]) * force * xyz[2]) / 10;
        let y = xyz[1] + (Math.cos(delta + xyz[2]) * force * xyz[2]) / 10;
        let z = xyz[2]; // + Math.cos(delta + i) * force * 10;

        v.setXYZ([x, y, z]);
      });
      return self;
    },
  });
})(MOD3);
