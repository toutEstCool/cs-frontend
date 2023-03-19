import { repeat, filter, seq, once, every, any, on, onlyEvent } from './helpers/index.js';

const container = document.querySelector('.container');
const box = document.querySelector('.box');

(async () => {
  const dnd = repeat(() =>
    filter(
      seq(
        once(box, 'mousedown'),
        every(any(on(container, 'mousemove'), on(container, 'mouseleave'), on(box, 'mouseup')), onlyEvent('mousemove')),
      ),
      onlyEvent('mousemove'),
    ),
  );

  for await (const evn of dnd) {
    const dX = Math.min(
      Math.max(0, evn.clientX - container.offsetLeft - container.clientLeft - box.clientWidth / 2),
      container.clientWidth - box.clientWidth,
    );

    const dY = Math.min(
      Math.max(0, evn.clientY - container.offsetTop - container.clientTop - box.clientHeight / 2),
      container.clientHeight - box.clientHeight,
    );

    box.style.left = `${dX}px`;
    box.style.top = `${dY}px`;
  }
})();
