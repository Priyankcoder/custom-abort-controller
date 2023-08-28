import { useEffect, useRef, useState } from "react";
import "./styles.css";

export default function App() {
  const abortController = useRef(null);

  const [friendName, setFriendName] = useState("Jane");
  const [friendList, setFriendList] = useState([]);

  const handleFriendChange = (name) => setFriendName(name);

  const fetchFriendList = (name, signal) => {
    return new Promise((resolve, reject) => {
      let timeoutId;
      let resolveHandler = (value, resolve) => {
        //remove event listener if everything went well
        if (signal instanceof AbortSignal) {
          signal.removeEventListener("abort", abortCall, { once: true });
        }
        resolve(value);
      };

      //abort call
      const abortCall = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          reject("call aborted");
        }
      };

      //attach "abort" event to signal
      if (signal instanceof AbortSignal) {
        signal.addEventListener("abort", abortCall, { once: true });
        //wrapping it inside setTimeout, so that I can stop function execution by clearing the timeoutId
        timeoutId = setTimeout(() => {
          if (name === "Jane") {
            console.log("jane");
            setTimeout(resolveHandler, 3000, ["a", "b", "c", "d"], resolve);
          } else {
            resolveHandler([1, 2, 3, 4], resolve);
          }
        }, 0);
      }
    });
  };

  const abortNetworkCall = () => {
    abortController?.current?.abort();
  };

  useEffect(() => {
    const controller = new AbortController();
    abortController.current = controller;
    const signal = controller.signal;
    fetchFriendList(friendName, signal)
      .then(setFriendList)
      .catch((e) => {
        if (signal.aborted) {
          console.log("abortedSignal");
        }
        console.log(e);
      });
    return () => controller.abort();
  }, [friendName]);

  return (
    <div>
      <h3>{friendName}</h3>
      <button onClick={() => handleFriendChange("Jane")}>Select Jane</button>
      <button onClick={() => handleFriendChange("Joe")}>Select Joe</button>
      <ul>
        {friendList.map((name, idx) => (
          <li key={`friend-${idx}`}>{name}</li>
        ))}
      </ul>
      <button onClick={abortNetworkCall}>Abort Call</button>
    </div>
  );
}
