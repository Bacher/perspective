const objects = [
  {
    pos: {
      x: 0,
      y: 0,
      z: 0,
    },
    fixed: true,
    center: {
      x: 16,
      y: 24,
    },
    img: createSprite('man'),
  },
  {
    pos: {
      x: -273,
      y: -187,
      z: 0,
    },
    img: createSprite('character'),
  },
  {
    pos: {
      x: 20,
      y: -30,
      z: 0,
    },
    img: createSprite('tree'),
  },
  {
    pos: {
      x: 50,
      y: 30,
      z: 0,
    },
    img: createSprite('home'),
  },
];

// window.addEventListener('mousemove', e => {
//   deltaX += e.movementX;
//   deltaY += e.movementY;
//   applyMatrix();
// });


draw();

// setInterval(() => {
//   xAngle += 9;
// }, 16);

container.addEventListener('scroll', () => {
  scroll = container.scrollTop / 600;

  applyMatrix();
});
