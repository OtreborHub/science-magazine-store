import { HeliaLibp2p, createHelia } from "helia";
import { strings } from "@helia/strings";
import { useState } from "react";

export async function heliaNode() {

  // const [helia, setHelia] = useState<HeliaLibp2p>()
  // const [isOnline, setIsOnline] = useState<boolean>(false)

    const heliaNode = await createHelia();
    // setHelia(heliaNode);
    // setIsOnline(heliaNode.libp2p.status === "started");
    console.log("online: " + heliaNode.libp2p.status === "started");
    const s = strings(heliaNode);
    // const myImmutableAddress = await s.add('hello world');
    // console.log(await s.get(myImmutableAddress));
}