import { h, Component } from 'preact';
import 'whatwg-fetch';
import Image from './Image';
import Lightbox from './Lightbox';

class Glry extends Component {
  state = { images: [...Array(10)], currentLightbox: -1 };

  async componentDidMount() {
    try {
      const res = await fetch(
        `https://storage.googleapis.com/cardamonchai-galleries/${
          this.props.id
        }/index.json`
      );
      let { images } = await res.json();
      if (this.props.id.indexOf('flickr/') === 0) {
        images = images.map(image => ({
          s: image.s.replace(
            'cardamonchai-galleries',
            'cardamonchai-galleries/flickr'
          ),
          m: image.m.replace(
            'cardamonchai-galleries',
            'cardamonchai-galleries/flickr'
          ),
          l: image.l.replace(
            'cardamonchai-galleries',
            'cardamonchai-galleries/flickr'
          ),
        }));
      }
      this.setState({ images });
    } catch (e) {
      console.error(e);
    }
  }

  activate = id => {
    this.setState({ currentLightbox: id });
  };

  rotateBack = () => {
    let newId = this.state.currentLightbox - 1;
    if (newId === -1) {
      newId = this.state.images.length - 1;
    }
    this.activate(newId);
  };
  rotateNext = () => {
    let newId = this.state.currentLightbox + 1;
    if (newId === this.state.images.length) {
      newId = 0;
    }
    this.activate(newId);
  };

  render() {
    return (
      <div>
        <ul className="glry-container">
          {this.state.images.map((imageData, i) => (
            <Image data={imageData} handleClick={() => this.activate(i)} />
          ))}
        </ul>
        <Lightbox
          data={this.state.images[this.state.currentLightbox]}
          close={() => this.activate(-1)}
          back={() => this.rotateBack()}
          next={() => this.rotateNext()}
        />
      </div>
    );
  }
}

export default Glry;
