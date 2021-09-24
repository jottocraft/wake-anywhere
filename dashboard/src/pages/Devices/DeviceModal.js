import Modal from "shamrock-ux/react/Modal";
import InputBox from "shamrock-ux/react/InputBox";
import Button from "shamrock-ux/react/Button";
import Dropdown from "shamrock-ux/react/Dropdown";
import { useCallback, useState } from "react";

export default function DeviceModal({ networks, editingDevice, setEditingDevice, setDevices }) {
    const [deviceState, setDeviceState] = useState(editingDevice);

    const [updateState, setUpdateState] = useState(false);
    const update = useCallback((del = false) => {
        if (del) {
            //Delete device
            setUpdateState("deleting");
            fetch("/api/devices", {
                method: "DELETE",
                body: JSON.stringify({ id: deviceState.id }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json()).then(data => {
                setEditingDevice(false);
                setDevices(data);
            });
        } else {
            //Save device
            setUpdateState("saving");
            fetch("/api/devices", {
                method: "PATCH",
                body: JSON.stringify(deviceState),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json()).then(data => {
                setEditingDevice(false);
                setDevices(data);
            });
        }
    }, [setUpdateState, deviceState, setDevices, setEditingDevice]);

    return (
        <Modal title={editingDevice.id ? "Edit Device" : "Add Device"} icon="computer" onClose={() => setEditingDevice(null)}>
            <div className="space-y-5">
                <div>
                    <p className="mb-1 font-medium">Device name</p>
                    <InputBox width={400} type="text" icon="drive_file_rename_outline" value={deviceState.name} onChange={(e) => setDeviceState({ ...deviceState, name: e.target.value })} />
                </div>
                <div>
                    <p className="mb-1 font-medium">Network</p>
                    <Dropdown items={Object.keys(networks).map(networkID => ({
                        name: networks[networkID].name,
                        icon: "public",
                        onClick: () => setDeviceState({ ...deviceState, network: networks[networkID].id })
                    }))}>
                        <Button right type="outline" icon="arrow_drop_down">{deviceState.network ? (networks[deviceState.network]?.name || "(deleted)") : "Select a network"}</Button>
                    </Dropdown>
                </div>
                <div>
                    <p className="mb-1 font-medium">MAC Address</p>
                    <InputBox width={400} type="text" icon="router" value={deviceState.mac} onChange={(e) => setDeviceState({ ...deviceState, mac: e.target.value })} />
                </div>
                <div className="mt-20 flex flex-row justify-between items-center">
                    <div className="space-x-2">
                        <Button type="primary" icon="save" onClick={() => update()}>{updateState == "saving" ? "Saving..." : "Save"}</Button>
                        <Button icon="close" onClick={() => setEditingDevice(null)}>Cancel</Button>
                    </div>
                    {editingDevice.id && <Button type="outline" icon="delete" onClick={() => update(true)}>{updateState == "deleting" ? "Deleting..." : "Delete"}</Button>}
                </div>
            </div>
        </Modal>
    )
}