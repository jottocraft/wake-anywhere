import Modal from "shamrock-ux/react/Modal";
import InputBox from "shamrock-ux/react/InputBox";
import Button from "shamrock-ux/react/Button";
import { useCallback, useState } from "react";

export default function NetworkModal({ editingNetwork, setEditingNetwork, setNetworks }) {
    const [networkState, setNetworkState] = useState(editingNetwork);

    const [updateState, setUpdateState] = useState(false);
    const update = useCallback((del = false) => {
        if (del) {
            //Delete network
            setUpdateState("deleting");
            fetch("/api/networks", {
                method: "DELETE",
                body: JSON.stringify({ id: networkState.id }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json()).then(data => {
                setEditingNetwork(false);
                setNetworks(data);
            });
        } else {
            //Save network
            setUpdateState("saving");
            fetch("/api/networks", {
                method: "PATCH",
                body: JSON.stringify(networkState),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json()).then(data => {
                setEditingNetwork(false);
                setNetworks(data);
            });
        }
    }, [setUpdateState, networkState, setNetworks, setEditingNetwork]);

    return (
        <Modal title={editingNetwork.id ? "Edit Network" : "Add Network"} icon="public" onClose={() => setEditingNetwork(null)}>
            <div className="space-y-5">
                <div>
                    <p className="mb-1 font-medium">Network name</p>
                    <InputBox width={400} type="text" icon="drive_file_rename_outline" value={networkState.name} onChange={(e) => setNetworkState({ ...networkState, name: e.target.value })} />
                </div>
                <div>
                    <p className="mb-1 font-medium">DNS route</p>
                    <InputBox width={400} type="text" icon="dns" value={networkState.dns} onChange={(e) => setNetworkState({ ...networkState, dns: e.target.value })} />
                </div>
                <div>
                    <p className="mb-1 font-medium">{editingNetwork.id ? "Secret (leave blank to keep existing)" : "Controller secret"}</p>
                    <InputBox width={400} type="password" icon="key" value={networkState.secret} onChange={(e) => setNetworkState({ ...networkState, secret: e.target.value })} />
                </div>
                <div className="mt-20 flex flex-row justify-between items-center">
                    <div className="space-x-2">
                        <Button type="primary" icon="save" onClick={() => update()}>{updateState == "saving" ? "Saving..." : "Save"}</Button>
                        <Button icon="close" onClick={() => setEditingNetwork(null)}>Cancel</Button>
                    </div>
                    {editingNetwork.id && <Button icon="delete" onClick={() => update(true)}>{updateState == "deleting" ? "Deleting..." : "Delete"}</Button>}
                </div>
            </div>
        </Modal>
    )
}