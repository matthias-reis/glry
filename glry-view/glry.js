import { h, render } from 'preact';
import Glry from './src';

document.addEventListener('DOMContentLoaded', function(event) {
  const galleries = document.querySelectorAll('[data-glry]');

  galleries.forEach(glryEl => {
    const glryId = glryEl.dataset.glry;
    render(<Glry id={glryId} />, glryEl);
  });
});
