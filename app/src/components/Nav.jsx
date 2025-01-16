import React from 'react';
import { Link } from "react-router-dom";

function Nav({ account, checkTronLink, loading }) {

  return (
    <>
      <div className="fixed z-10 backdrop-blur-sm w-full">
        <section className="relative mx-auto">

          <nav className="flex justify-between text-white w-screen px-24">
            <div className="px-5 xl:px-12 py-6 flex w-full items-center">
              <Link className="text-3xl font-bold font-heading no-underline text-white" to="/">
                Ignitus Networks 
              </Link>

              <ul className="hidden md:flex px-4 mx-auto font-semibold font-heading space-x-12">
                <li>
                  <Link className="text-white hover:text-gray-300 no-underline" to="/create">Create</Link>
                </li>
                <li>
                  <Link className="text-white hover:text-gray-300 no-underline" to="/">Home</Link>
                </li>
              </ul>

              <div className="xl:flex space-x-5 items-center">
                {loading ? (
                  <button type="button" className="inline-flex items-center justify-center border-[0.5px] p-2 w-22 h-9 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-hamburger" aria-expanded="false" onClick={checkTronLink}>
                    Connect wallet
                  </button>
                ) : (
                  <button type="button" className="inline-flex items-center justify-center border-[0.5px] p-2 w-22 h-9 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-hamburger" aria-expanded="false" onClick={checkTronLink}>
                    Connected
                  </button>
                )}
              </div>
            </div>
          </nav>
        </section>
      </div>
    </>
  );
}

export default Nav;
