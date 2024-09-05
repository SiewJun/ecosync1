import { Link } from "react-router-dom";

const EcoSync = () => {
  return (
    <>
      <Link to="/">
        <div className="flex gap-2 justify-center items-center">
          <img src="/ecosync.svg" alt="Ecosync Logo" width="25" height="25" />
          <span className="md:text-md text-sm font-inter font-semibold tracking-tight">
            EcoSync
          </span>
        </div>
      </Link>
    </>
  );
};

<p className="md:text-xl text-md font-bold antialiased text-black dark:text-white">
  EcoSync
</p>;

export default EcoSync;
