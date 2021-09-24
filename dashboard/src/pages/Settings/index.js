import { useContext, useState } from "react";

import Container from "shamrock-ux/react/Container";
import ButtonGroup from "shamrock-ux/react/ButtonGroup";
import Button from "shamrock-ux/react/Button";
import Link from "shamrock-ux/react/Link";

import themeContext from "shamrock-ux/react/contexts/theme";

import NetworkModal from "./NetworkModal";

export default function Settings({ networks, setNetworks }) {
    const theme = useContext(themeContext);
    const [editingNetwork, setEditingNetwork] = useState(null);

    return (
        <Container>
            {editingNetwork && <NetworkModal editingNetwork={editingNetwork} setEditingNetwork={setEditingNetwork} setNetworks={setNetworks} />}

            <div className="mt-12 space-y-12">
                <div>
                    <h1 className="text-4xl font-bold">Settings</h1>
                </div>

                <div>
                    <h2 className="text-3xl font-semibold">Theme</h2>
                    <div className="mt-4">
                        <ButtonGroup items={[
                            { name: "System", icon: "computer", active: theme.id == "system", onClick: () => theme.update("system") },
                            { name: "Light", icon: "light_mode", active: theme.id == "light", onClick: () => theme.update("light") },
                            { name: "Dark", icon: "dark_mode", active: theme.id == "dark", onClick: () => theme.update("dark") }
                        ]} />
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-semibold">Networks</h2>
                    <div className="mt-4">
                        <Button onClick={() => setEditingNetwork({})} icon="add">Add</Button>
                    </div>
                    <div className="mt-10">
                        {
                            networks == null ? (
                                <h5 className="text-lg font-medium">Loading configured networks...</h5>
                            ) : Object.keys(networks).length == 0 ? (
                                <h5 className="text-lg font-medium">You haven't added any networks yet</h5>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-lg font-semibold text-left">Name</th>
                                            <th className="text-lg font-semibold text-left">DNS route</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(networks).map(networkID => (
                                            <tr>
                                                <td className="text-lg font-medium">
                                                    {networks[networkID].name}
                                                </td>
                                                <td className="text-lg">
                                                    {networks[networkID].dns}
                                                </td>
                                                <td className="py-2 text-right">
                                                    <Button onClick={() => setEditingNetwork(networks[networkID])} icon="edit">Edit</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )
                        }
                    </div>
                </div>

                <div>
                    <div className="mt-80 py-14">
                        <div className="text-center text-type-20">
                            <div className="flex flex-row items-center justify-center">
                                <img alt="jottocraft logo" className="h-10 mr-4"
                                    src="https://cdn.jottocraft.com/images/footerImage.png" />
                                <h5 className="text-2xl font-medium">jottocraft</h5>
                            </div>
                            <p className="mt-2">(c) jottocraft 2021. <Link href="https://github.com/jottocraft/wake-anywhere">source code</Link> / <Link href="https://github.com/jottocraft/wake-anywhere/blob/main/LICENSE">license</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}