# Distractor rewrites for quizzes releasing 28 Nov 2026 (answer index and correct meaning unchanged).
P = {
"NET-OSI-004": [
 "They are dropped entirely, since modern applications no longer need dialogue control or data formatting",
 "They are moved into the network interface card firmware, which handles encoding and session state",
 "They are implemented inside the transport layer, where TCP handles encryption and session checkpoints",
 "They are absorbed into the application layer (e.g. TLS libraries, cookies, JSON encoding)"],
"NET-TCP-009": [
 "C for the simulation core and Lua for configuring topologies and traffic",
 "Java for the simulation core and Python for scripting topologies and events",
 "C++ for the simulation core and OTcl for scripting topologies and events",
 "Go for the simulation core and YAML files for describing topologies and events"],
"NET-DNSFW-006": [
 "It judges each packet in isolation against static header rules, keeping no memory of connections",
 "It tracks every TCP connection in a state table and admits only packets that match an open session",
 "It reassembles application payloads and inspects them for malware signatures before forwarding",
 "It authenticates each user before relaying traffic, acting as a proxy between inside and outside hosts"],
"NET-DHRSA-004": [
 "DH is only secure for primes below 1,000, so an attacker can factor larger moduli and recover the key",
 "The generator g must stay secret, and an attacker who learns it can recompute the shared key directly",
 "The shared key itself is sent in clear during the exchange, so anyone on the path can read it",
 "Nothing proves who sent each half-key, so an attacker can substitute its own and share a key with each side"],
"NET-OSI-013": [
 "VLAN hopping - upgrade every web service to TLS 1.3",
 "XML external entity injection - enable SYN cookies on the server",
 "Ping flood - set the HttpOnly flag on all session cookies",
 "Session fixation - issue a fresh session ID after login"],
"NET-TCP-013": [
 "1,501, acknowledging the first segment",
 "501 (duplicate ACKs)",
 "2,501, acknowledging the second segment",
 "3,501, acknowledging all three segments"],
"NET-LANATK-012": [
 "The server detects the active host and refuses every SYN that carries its source address",
 "The real host completes the three-way handshake on the attacker's behalf, opening real connections",
 "The real host receives an unexpected SYN-ACK and replies with RST, which clears the half-open entry",
 "Upstream routers recognise the active host and drop all packets claiming to come from it"],
"NET-IPSEC-012": [
 "NAT strips the AH header from every packet, so the receiver finds no ICV to verify",
 "AH encrypts the IP header, which the NAT router cannot read in order to rewrite addresses",
 "NAT routers are configured to drop every packet carrying IP protocol number 51 by default",
 "NAT rewrites the source IP (and ports with PAT), which AH's ICV covers, so verification fails"],
"AA-EFF-005": [
 "It always yields a numerically smaller bound than the average case for the same algorithm",
 "It gives a guarantee for every input and needs no assumption about the input distribution",
 "It is the only measure that ignores constant factors and lower-order terms in the running time",
 "Average-case running time cannot be expressed in O-notation, so worst case is the only option"],
"AA-DP-013": [
 "R[n] = p[n] + R[n − 1], adding one piece of length n at each step",
 "R[n] = max(p[n], R[n − 1]), comparing selling whole against one shorter rod",
 "R[n] = max over 1 ≤ i ≤ n of (p[i] + R[n − i]), with R[0] = 0",
 "R[n] = max over 1 ≤ i ≤ n of (p[i] · R[n − i]), with R[0] = 1"],
"AA-MASTER-006": [
 "Θ(n^(log₂7)) ≈ Θ(n^2.81)",
 "Θ(n² log n), since f(n) = Θ(n²)",
 "Θ(n³), as in the naive method",
 "Θ(n²), dominated by the additions"],
"AA-DIJK-010": [
 "O(V²); preferable for dense graphs where E = Θ(V²)",
 "O(V²); preferable for sparse graphs where E = O(V)",
 "O(E log V); preferable for dense graphs where E = Θ(V²)",
 "O(VE); never preferable to a binary-heap implementation"],
"AA-INV-005": [
 "During the merge, add (remaining in A) whenever a_i > 2·b_j, and otherwise output elements exactly as usual",
 "Sort the whole array first, then count pairs with a_i > 2·a_j by binary search on the original order",
 "Run ordinary Sort-and-Count inversion counting unchanged and then divide the final total by 2",
 "Before merging the sorted halves, run a separate two-pointer pass that counts, for each b in B, the elements of A greater than 2b; then merge normally"],
"AA-SORT-007": [
 "An in-place merge that needs only O(1) extra space",
 "Fewer key comparisons than the strict < test would need",
 "Stability: equal keys keep their original relative order",
 "A Θ(n) best case whenever the input is already sorted"],
"AA-GRAPH-007": [
 "It finds a back edge while traversing, exactly as DFS-based cycle detection does",
 "It outputs fewer than V vertices, because at some point no remaining vertex has in-degree 0",
 "Some vertex is dequeued and output twice, once for each incoming edge on the cycle",
 "The queue never becomes empty, so the algorithm loops forever on a cyclic graph"],
"AA-LI-003": [
 "It should use ≥ instead of > in the key comparison, otherwise equal keys are not sorted correctly",
 "When i reaches 0 it reads A[0] before checking i > 0; the test i > 0 must come first",
 "The loop should increment i rather than decrement it, so elements shift towards the end",
 "There is no bug; the order of the two conditions in the loop test does not matter"],
"AA-DP-017": [
 "Earliest-finish greedy, because it is optimal for unweighted interval selection and weights change nothing",
 "OPT(j) = max(w_j + OPT(p(j)), OPT(j − 1)), because earliest-finish greedy can drop a heavy job",
 "Pick jobs by decreasing weight and discard overlaps, which is optimal by an exchange argument",
 "OPT(j) = w_j + OPT(j − 1), because every job should be included to maximise total weight"],
"BCA-BCF-091": [
 "A blockchain is one kind of DLT; DAG-based ledgers are another",
 "Every distributed ledger, by definition, requires proof-of-work mining",
 "The two terms are exact synonyms for one and the same data structure",
 "A blockchain is a centralised, single-operator variant of a distributed ledger"],
"BCA-POW-094": [
 "The nonce, then extra-nonce or timestamp when nonces run out",
 "The previous block hash, changing it until a lower hash is found",
 "The signatures inside transactions, re-signing them on every attempt",
 "The difficulty bits, lowering them until some hash qualifies as valid"],
"BCA-ENDORSE-097": [
 "Which certificate authority issues the member organisations' certificates",
 "Which orgs' peers must sign a transaction's simulation results",
 "Which users may join the channel and read the channel ledger",
 "How and when the ordering service cuts transactions into new blocks"],
"BCA-HASH-103": [
 "0 padding bits; 512 bits in total",
 "448 padding bits; 960 bits in total",
 "64 padding bits; 512 bits in total",
 "512 padding bits; 1024 bits in total"],
"BCA-RBAC-115": [
 "Allowed if the purchase amount is below a set threshold",
 "Denied: both roles cannot be active in one session",
 "Allowed, since U is legitimately assigned both roles",
 "Invalid: the assignment itself already breaks static SoD"],
"ML-GD-010": [
 "It makes the loss contours rounder, so a single learning rate suits every parameter direction",
 "It reduces the number of parameters, so each gradient step updates fewer weights and runs faster",
 "It makes any loss function convex, so gradient descent can no longer get stuck in a local minimum",
 "It removes the need to choose a learning rate, since all features now share the same unit scale"],
"ML-SVM-015": [
 "Correctly classified and lying outside the margin",
 "Lying exactly on the margin as a support vector",
 "Inside the margin but still correctly classified",
 "Misclassified, on the wrong side of the decision boundary"],
"ML-KMEANS-014": [
 "K-medoids, which uses actual data points as centres",
 "K-means run for many more iterations until convergence",
 "K-means with a larger K and no other change to the method",
 "K-means++ initialisation alone, keeping the mean-based update"],
"ML-LOGREG-013": [
 "The learning rate is too small; increase it steadily until the weights converge to a finite optimum",
 "The sigmoid makes the loss non-convex, so gradient descent is trapped; use random restarts to escape",
 "The data must be standardised first; then a finite maximum-likelihood solution always exists and is reached",
 "The likelihood keeps improving as ‖θ‖ → ∞ along the separating direction, so no finite optimum exists; add L2 regularisation (or stop early)"],
"ML-LOGREG-010": [
 "The class probability p",
 "The log-odds, ln(p/(1 − p))",
 "The odds ratio, p/(1 − p)",
 "The predicted class label y"],
"ML-NB-010": [
 "Directly models P(y | x) from the data without modelling the feature distribution",
 "Generates synthetic training examples to augment the dataset before classifying",
 "Models P(x | y) and P(y), then uses Bayes' rule to obtain P(y | x)",
 "Learns a separating decision boundary by maximising the margin between the classes"],
"ML-KMEANS-013": [
 "Deterministically, as the point farthest from all the centres already chosen, so the centres spread out",
 "Uniformly at random from all data points, exactly as in the standard random initialisation",
 "As the mean of all data points not yet assigned to a centre, recomputed after each choice",
 "At random with probability proportional to D(x)², the squared distance to the nearest centre already chosen"],
"ML-LINREG-010": [
 "The coefficient becomes 250 per cm and the predictions are unchanged",
 "The coefficient becomes 0.025 per cm and the predictions are unchanged",
 "The coefficient stays at 2.5 and every prediction is multiplied by 100",
 "The coefficient becomes 0.025 per cm and the training MSE falls sharply"],
"ML-KMEANS-017": [
 "Run K-means on the raw, unscaled features with K chosen by minimum SSE, letting the elbow plot decide the number of segments",
 "Map the channel to the numbers 1, 2 and 3, then run a single K-means with random initialisation on all three features",
 "Standardise the numeric features, handle the categorical one with a suitable method (e.g. K-prototypes), run several K-means++ restarts, and choose K by silhouette plus business review",
 "Use KNN with k = 5 on the customer table, treating each customer's five nearest neighbours as one segment"],
"IOT-COAP-094": [
 "Publish/subscribe over TCP through a central broker",
 "Data-centric publish/subscribe over RTPS, without a broker",
 "REST request/response over UDP (port 5683, 5684 with DTLS)",
 "Trigger-action applets running in the cloud over HTTPS"],
"IOT-SEC-097": [
 "Topic names, QoS levels and retained-message flags on the broker",
 "Channel busy ratio, number of backoffs and retransmission counts",
 "The IP address range in use and the size of the local DNS cache",
 "ADC resolution and reference voltage of the node's sensor inputs"],
"IOT-SENSOR-100": [
 "Amplification, filtering, impedance matching and level shifting",
 "Packet framing, routing between nodes and acknowledging receipt",
 "Matching topics to subscribers and enforcing broker access control",
 "Photon absorption in the photoconductive layer of the sensing element"],
"IOT-ALOHA-118": [
 "Both give 0.2963, because the throughput curve is flat near its optimum, so the shortcut loses nothing",
 "The shortcut p = 1/4 gives 0.2963, which is higher than the exact optimum because it reduces collisions",
 "Exact p = 1/3 gives 0.2963; the shortcut p = 1/4 gives 0.2812, a noticeable loss at small N",
 "Exact p = 1/2 gives 0.2500, which is the true maximum, while the shortcut p = 1/4 gives less"],
"IOT-MQTT-096": [
 "It matches exactly one topic level and may appear anywhere in the filter",
 "It matches only the parent level itself and nothing at all below it",
 "It matches zero or more levels and must be the last character of the filter",
 "It must be the first character of the filter and matches any one root topic"],
"IOT-IFTTT-099": [
 "A lightweight transport protocol competing with MQTT for sensor telemetry",
 "A duty-cycled MAC scheme that schedules transmissions for low-power radios",
 "A cloud automation service whose Applets link a trigger to an action",
 "A signal-conditioning circuit that filters and amplifies raw sensor output"],
"IOT-RFID-102": [
 "It uses a small internal battery that lasts for the whole life of the tag",
 "It draws power optically from the barcode printed beside it on the label",
 "It harvests energy from the electromagnetic field emitted by the reader's antenna",
 "It is wired to the reader through a thin conductive strip embedded in the label"],
"IOT-MQTT-117": [
 "Both the delivery load and the publication rate rise 25×",
 "Delivery load rises 96×; the publication rate halves",
 "Delivery load rises 25×; the publication rate is unchanged",
 "Delivery load is unchanged; the publication rate rises 25×"],
"IOT-MAC-120": [
 "a stays at 0.025 because distance is unchanged; nothing else needs to change",
 "a falls to 0.00025; no change is needed, as efficiency improves automatically",
 "a rises from 0.025 to 2.5; frames must grow to 100,000 bits",
 "a rises to 2.5; frames must shrink to 10 bits so collisions are detected sooner"],
}
