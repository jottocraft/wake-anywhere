import { useState, useEffect } from "react";

import NavigationController from "shamrock-ux/react/NavigationController";
import Container from "shamrock-ux/react/Container";

import {
  Switch,
  Route,
  useLocation,
  useHistory
} from "react-router-dom";

import Devices from "./pages/Devices";
import Settings from "./pages/Settings";

import './App.css';

function App() {
  const history = useHistory();
  const location = useLocation();

  //Get and store devices data state
  const [devices, setDevices] = useState(null);
  useEffect(() => {
    fetch("/api/devices").then(r => r.json()).then(data => {
      setDevices(data);
    });
  }, []);

  //Get and store networks data state
  const [networks, setNetworks] = useState(null);
  useEffect(() => {
    fetch("/api/networks").then(r => r.json()).then(data => {
      setNetworks(data);
    });
  }, []);

  return (
    <NavigationController
      navbar={{
        title: "Wake Anywhere",
        logo: "/icon.svg",
        canRecess: true,
        items: [
          { name: "Devices", icon: "computer", active: location.pathname == "/", onClick: () => history.push("/") },
          { name: "Settings", icon: "settings", active: location.pathname == "/settings", onClick: () => history.push("/settings") }
        ],
        accountName: (window.location.host == "demo.wakeanywhere.com") && "Demo (read-only)",
        accountDropdown: (window.location.host == "demo.wakeanywhere.com") && [
          { name: "Source Code", icon: "code", onClick: () => window.open("https://github.com/jottocraft/wake-anywhere") },
          { name: "Documentation", icon: "article", onClick: () => window.open("https://github.com/jottocraft/wake-anywhere#readme") },
          { name: "hello@jottocraft.com", icon: "email", onClick: () => window.open("mailto:hello@jottocraft.com") }
        ]
      }}
    >
      <Switch>
        <Route path="/settings">
          <Settings networks={networks} setNetworks={setNetworks} />
        </Route>
        <Route exact path="/">
          <Devices networks={networks} devices={devices} setDevices={setDevices} />
        </Route>
        <Route path="*">
          <Container>
            <div className="mt-12">
              <h1 className="text-4xl font-bold">404</h1>
              <h5 className="text-2xl font-medium">The requested URL was not found</h5>
            </div>
          </Container>
        </Route>
      </Switch>
    </NavigationController>
  );
}

export default App;
