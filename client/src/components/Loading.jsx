import { RotatingLines } from 'react-loader-spinner';
const Loading = () => {
  return (
    <div className="app">
      <h1>Loading...<RotatingLines
              strokeColor="purple"
              strokeWidth="5"
              animationDuration="0.75"
              width="50"
              visible={true}
            /></h1>
    </div>
  );
};

export default Loading;
