import classes from './Loading.module.css';

const LoadingContent = () => {
  return (
    <div className={classes.container}>
      <div className={classes.spinner} />
      <p className={classes.loading}>Fetching data...</p>
    </div>
  );
};

export default LoadingContent;