
import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Search, Plus, BarChart3, User } from "lucide-react";

const Navbar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-szalty-lightGray py-1 z-10 shadow-lg">
      <div className="container mx-auto max-w-lg px-4">
        <nav className="flex items-center justify-center">
          <div className="flex items-center justify-around w-full max-w-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${
                isActive ? "text-szalty-blue" : "text-szalty-blueGray"
              }`
            }
            end
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Feed</span>
          </NavLink>
          
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${
                isActive ? "text-szalty-blue" : "text-szalty-blueGray"
              }`
            }
          >
            <Search size={24} />
            <span className="text-xs mt-1 font-medium">Explore</span>
          </NavLink>
          
          <NavLink
            to="/post"
            className="flex flex-col items-center relative"
          >
            <div className="bg-szalty-blue rounded-full p-3 -mt-6 shadow-lg border-4 border-white">
              <Plus size={24} className="text-white" />
            </div>
            <span className="text-xs mt-1 font-medium text-szalty-blueGray">Create</span>
          </NavLink>
          
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${
                isActive ? "text-szalty-blue" : "text-szalty-blueGray"
              }`
            }
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1 font-medium">Analytics</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${
                isActive ? "text-szalty-blue" : "text-szalty-blueGray"
              }`
            }
          >
            <User size={24} />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
