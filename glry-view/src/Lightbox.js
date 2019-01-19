import { h, Component } from 'preact';
import { Left, Right, Close } from './icons';
import { Loader } from './icons';

class Lightbox extends Component {
  state = { src: '' };
  hasEventListener = false;

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data !== this.props.data) {
      this.setState({ src: '' });
      const img = new Image();
      img.src = nextProps.data.l;
      img.onload = () => this.setState({ src: nextProps.data.l });

      if (!this.hasEventListener) {
        console.log('adding listener');
        document.addEventListener('keydown', this.handleKey, false);
        console.log('added listener');
        this.hasEventListener = true;
      }
    }
    if (!nextProps.data && this.hasEventListener) {
      console.log('removing listener');
      document.removeEventListener('keydown', this.handleKey, false);
      this.hasEventListener = false;
    
  }

  handleKey = ev => {
    if (ev.key === 'Escape') {
      this.props.close();
    } else if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
      this.props.next();
    } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
      this.props.back();
    }
  };

  render() {
    const { data, back, next, close } = this.props;
    return (
      data && (
        <div className="glry-lightbox">
          {this.state.src ? (
            <img src={this.state.src} />
          ) : (
            <div className="glry-lightbox-loading">
              <Loader className="glry-lightbox-loading-icon" color="#fff" />
            </div>
          )}

          <button className="glry-button glry-back" onClick={back}>
            <Left />
          </button>
          <button className="glry-button glry-next" onClick={next}>
            <Right />
          </button>
          <button className="glry-button glry-close" onClick={close}>
            <Close />
          </button>
        </div>
      )
    );
  }
}

export default Lightbox;
