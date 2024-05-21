import { ParseTx } from "../src/tx-parsing/parsing";
import { client } from "./common/common";

describe("Tx Parsing", () => {
  it("all", async () => {
    const txSigs = [
      "k4eiJmPATkjGbVXZn5EmjnpVHL8R8NXNu9LxXvrPruPHV2KR5oePTUUHBCJbpXHM3neZQHErApzN9cbN35yUEux", // newPool (null)
      "66oryLCS9H5Fr1MZ7ELw848jcaVXfVcAx37QRTj3BBxmQjG8nEc86MFhU5MJF9MV9qJPveSXE58p1yTP9RE4ntLo", // newPool
      "4Jw255zfpNg3D1kNcVWJTbNKyt8gE6fdEcezR3HqpdS1QaeBaqjhw1WXDxhMjnc2y87abaEsdKWaHM7WCKvSaJyZ", // swapY
      "5qVty11hMwcG6da19scFzj1JFG4YeM5trAtRdsbi7csUnrZqTroPrgRG25jY4ujDWx3XRupYjTVm8Zdyc6Z6eZCx", // swapX
      "2PtG1vnaGrKWsARCYpbcGvVHfftfNc2YPqhLn11yZYwJUN5d7xRBhQ768T6HSSVUvpz2wqsCyBcTzBnx9i2Yv7AM", // InitStakingPool
      "23LnCq3wcTpP6dhVDkGkdc2D2RyVCm2Kr56D3Jf56AiFSBdqCxe8TN1jKmkVwVBKq6NiNaVuYEuE9otjwcQwdJRJ", // GoLive
      "3gvAMUyRyZZBwacwgyVtb7ihfDDsNhhZSyGiwvm8rbUCUDguqMYasuJfzXfroQKNRNqtUx8id3tSojecR5CtPg19", // CreateMeta
    ];

    for (let i = 0; i < txSigs.length; i++) {
      console.log(await ParseTx(txSigs[i], client));
    }
  });
});
