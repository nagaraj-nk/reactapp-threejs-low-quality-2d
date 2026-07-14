import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Home
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A minimal React app with a navbar, routing, dark mode, and a
          react-three-fiber scene.
        </p>
        <Link
          to="/scene"
          className="inline-block mt-6 px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          View 3D Scene
        </Link>
      </div>
    </div>
  );
};

export default Home;
