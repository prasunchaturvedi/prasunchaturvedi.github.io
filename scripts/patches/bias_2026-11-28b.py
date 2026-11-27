P = {
"NET-DHRSA-004": [
 "DH is only secure for primes below 1,000, so an attacker can factor larger moduli and recover the shared key",
 "The generator g must stay secret, and an attacker who learns it can recompute the shared key directly",
 "The shared key itself is sent in clear during the exchange, so anyone on the path can simply read it",
 "Nothing proves who sent each half-key, so an attacker can substitute its own and share a key with each side"],
"NET-LANATK-012": [
 "The server detects that the host is active and refuses every SYN that carries its source address",
 "The real host completes the three-way handshake on the attacker's behalf, opening real connections",
 "The real host receives an unexpected SYN-ACK and replies with RST, clearing the half-open entry",
 "Upstream routers recognise the active host and drop all packets claiming to come from its address"],
"NET-IPSEC-012": [
 "NAT strips the AH header from every packet, so the receiver finds no integrity check value to verify",
 "AH encrypts the IP header, which the NAT router cannot read in order to rewrite addresses",
 "NAT routers are configured to drop every packet carrying IP protocol number 51 by default",
 "NAT rewrites the source IP (and ports with PAT), which AH's ICV covers, so verification fails"],
"AA-INV-005": [
 "During the merge itself, add (remaining in A) whenever a_i > 2·b_j, and otherwise output elements exactly as usual",
 "Sort the whole array first, then count pairs with a_i > 2·a_j by binary search on the original order of elements",
 "Run ordinary Sort-and-Count inversion counting unchanged on the input and then divide the final total by 2",
 "Before merging, run a separate two-pointer pass counting, for each b in B, the elements of A above 2b; then merge normally"],
"AA-SORT-007": [
 "An in-place merge that needs only O(1) extra working space",
 "Fewer key comparisons than the strict < test would need",
 "Stability: equal keys keep their original relative order",
 "A Θ(n) best case whenever the input is already sorted"],
"AA-GRAPH-007": [
 "It finds a back edge while traversing the graph, exactly as DFS-based cycle detection does",
 "It outputs fewer than V vertices, because at some point no remaining vertex has in-degree 0",
 "Some vertex is dequeued and output twice, once for each incoming edge that lies on the cycle",
 "The queue never becomes empty, so the algorithm loops forever whenever the graph is cyclic"],
"BCA-HASH-103": [
 "0 padding bits; the 448 bits plus length make 512",
 "448 padding bits; 960 bits in total",
 "64 padding bits; 512 bits in total",
 "512 padding bits; 1024 bits in total"],
"ML-SVM-015": [
 "Correctly classified and lying outside the margin entirely",
 "Lying exactly on the margin, acting as a support vector",
 "Inside the margin but still correctly classified",
 "Misclassified, on the wrong side of the decision boundary"],
"ML-LOGREG-013": [
 "The learning rate is too small; increase it steadily until the weights finally converge to a finite optimum",
 "The sigmoid makes the loss non-convex, so gradient descent is trapped in a poor region; use random restarts to escape",
 "The data must be standardised first; once features are on one scale a finite maximum-likelihood solution always exists",
 "The likelihood keeps improving as ‖θ‖ → ∞ along the separating direction, so no finite optimum exists; add L2 (or stop early)"],
"ML-KMEANS-013": [
 "Deterministically, as the point farthest from all the centres already chosen, so the centres spread out",
 "Uniformly at random from all data points, exactly as in the standard random initialisation of K-means",
 "As the mean of all data points not yet assigned to any centre, recomputed after each new choice is made",
 "At random with probability proportional to D(x)², the squared distance to the nearest chosen centre"],
"ML-KMEANS-017": [
 "Run K-means on the raw, unscaled features with K chosen by minimum SSE, letting the elbow plot alone decide the number of segments",
 "Map the channel to the numbers 1, 2 and 3, then run a single K-means with random initialisation on all three features together",
 "Standardise the numeric features, handle the channel with K-prototypes, use several K-means++ restarts, choose K by silhouette",
 "Use KNN with k = 5 on the customer table, treating each customer and their five nearest neighbours as one marketing segment"],
"IOT-RFID-102": [
 "It uses a small internal battery that lasts for the whole working life of the tag",
 "It draws power optically from the barcode printed beside it on the same label",
 "It harvests energy from the electromagnetic field emitted by the reader's antenna",
 "It is wired to the reader through a thin conductive strip embedded in the label"],
}
