import { BoundPoolClient } from "../../../src/bound-pool/BoundPoolClient";
import { client } from "../../common";

// yarn tsx examples/bonding-pool/from/bound-pool-from-tx-signature.ts
(async () => {
  const poolCreationSignature =
    "pYSeWuEhRMUW1wrnUTU6VJZ77uWu9cAZUB9EVfYw9xjcfV5PERfZkV6NyVTWLi5jKVWuSfwUxB9Ad6j9wqARsrG";
  const boundPoolInstance = await BoundPoolClient.fromPoolCreationTransaction({ client, poolCreationSignature });

  console.debug("boundPoolInstance: ", boundPoolInstance.id.toString());
})();
