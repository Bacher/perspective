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

let moveInterval;

window.addEventListener('click', e => {
  const p = { x: e.clientX, y: e.clientY };

  const curX = deltaX;
  const curY = deltaY;

  const dX = x - curX;
  const dY = y - curY;
  let i = 0;

  clearInterval(moveInterval);
  moveInterval = setInterval(() => {
    deltaX = curX + (dX * i) / 100;
    deltaY = curY + (dY * i) / 100;
    applyMatrix();
    i++;

    if (i === 100) {
      objects[1].hidden = true;
      clearInterval(moveInterval);
    }
  }, 16);
});


draw();

// setInterval(() => {
//   xAngle += 9;
// }, 16);

container.addEventListener('scroll', () => {
  scroll = container.scrollTop / 600;

  applyMatrix();
});
