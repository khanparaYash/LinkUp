import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function HostMeeting() {
  const navigate = useNavigate();
  const [id, setId] = useState("");

  const create = () => {
    const newId = uuidV4();
    setId(newId);
    navigate(`/meeting/${newId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
      <Card className="max-w-md w-full text-center rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Host a Meeting
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
          Click the button below to create a new meeting room.
        </p>

        <Button onClick={create} className="w-full mb-4">
          Create Room
        </Button>

        {id && (
          <p className="text-gray-700 dark:text-gray-200 mt-2 break-words">
            Meeting ID: <span className="font-mono">{id}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
