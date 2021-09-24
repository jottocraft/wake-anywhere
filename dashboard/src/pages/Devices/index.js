import { useCallback, useState } from "react";

import Container from "shamrock-ux/react/Container";
import Button from "shamrock-ux/react/Button";

import DeviceModal from "./DeviceModal";

export default function Devices({ networks, devices, setDevices }) {
    const [editingDevice, setEditingDevice] = useState(null);

    //Handle wake requests
    const [wakeState, setWakeState] = useState(null);
    const wakeDevice = useCallback((deviceID) => {
        setWakeState(deviceID);

        fetch("/api/devices/wake", {
            method: "PATCH",
            body: JSON.stringify({ id: deviceID }),
            headers: { "Content-Type": "application/json" }
        }).then(r => r.json()).then(data => {
            setWakeState(null);
            setDevices(data);
        });
    }, [setWakeState, setDevices]);

    return (
        <Container>
            {editingDevice && <DeviceModal networks={networks} editingDevice={editingDevice} setEditingDevice={setEditingDevice} setDevices={setDevices} />}

            <div className="mt-12 space-y-12">
                <div>
                    <h1 className="text-4xl font-bold">Devices</h1>
                    {
                        ((networks !== null) && (Object.keys(networks).length !== 0)) && (
                            <div className="mt-4">
                                <Button onClick={() => setEditingDevice({})} icon="add">Add</Button>
                            </div>
                        )
                    }
                </div>

                <div className="mt-10">
                    {
                        (devices == null) || (networks == null) ? (
                            <h5 className="text-lg font-medium">Loading configured devices and networks...</h5>
                        ) : (Object.keys(devices).length == 0) && (Object.keys(networks).length == 0) ? (
                            <h5 className="text-lg font-medium">You haven't configured any networks yet. Add a network in the Settings tab first, then return here to begin adding devices.</h5>
                        ) : (Object.keys(devices).length == 0) && (Object.keys(networks).length !== 0) ? (
                            <h5 className="text-lg font-medium">You haven't configured any devices yet</h5>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className="text-lg font-semibold text-left">Name</th>
                                        <th className="text-lg font-semibold text-left">Last woken</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(devices).map(deviceID => (
                                        <tr>
                                            <td className="text-lg font-medium">
                                                {devices[deviceID].name}
                                            </td>
                                            <td className="text-lg">
                                                {devices[deviceID].lastWoken ? new Date(devices[deviceID].lastWoken).toLocaleString() : "Never"}
                                            </td>
                                            <td className="py-2 space-x-2 text-right">
                                                <Button type="primary" onClick={() => wakeDevice(deviceID)} icon="power_settings_new">{wakeState == deviceID ? "Waking up..." : "Wake up"}</Button>
                                                <Button onClick={() => setEditingDevice(devices[deviceID])} icon="edit">Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    }
                </div>
            </div>
        </Container>
    );
}