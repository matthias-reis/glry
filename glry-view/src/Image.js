import { h, Component } from 'preact';
import { Loader } from './icons';

const Placeholder = () => (
  <li className="glry-item glry-item-empty">
    <Loader className="glry-loader" color="#bbb" />
  </li>
);

const VisibleImage = ({ data, handleClick }) => {
  return (
    <li className="glry-item" onClick={handleClick}>
      <img src={data.s} />
    </li>
  );
};

class MyImage extends Component {
  state = { hasImage: false };

  render() {
    if (this.props.data && !this.state.hasImage) {
      const img = new Image();
      img.src = this.props.data.s;
      img.onload = () => this.setState({ hasImage: true });
    }

    if (!this.props.data || !this.state.hasImage) {
      return <Placeholder />;
    } else {
      return (
        <VisibleImage
          data={this.props.data}
          handleClick={this.props.handleClick}
        />
      );
    }
  }
}

export default MyImage;
