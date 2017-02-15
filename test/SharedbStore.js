
import describeStore from "test/Store";
import SharedbStore from "olojs/stores/SharedbStore";

describeStore("SharedbStore", SharedbStore, "localhost:8080");
//describeStore("SharedbStore", SharedbStore, "130.211.85.222"); 