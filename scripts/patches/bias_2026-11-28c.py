P = {
"AA-INV-005": [
 "During the merge itself, add (remaining in A) whenever a_i > 2·b_j, and otherwise output elements exactly as usual",
 "Sort the whole array first, then count pairs with a_i > 2·a_j by binary search on the original order of elements",
 "Run ordinary Sort-and-Count inversion counting unchanged on the input and then divide the final total by 2",
 "Before merging, a separate two-pointer pass counts, for each b in B, elements of A above 2b; then merge normally"],
"ML-LOGREG-013": [
 "The learning rate is too small; increase it steadily until the weights finally converge to a finite optimum",
 "The sigmoid makes the loss non-convex, so gradient descent is trapped in a poor region; use random restarts to escape",
 "The data must be standardised first; once features are on one scale a finite maximum-likelihood solution always exists",
 "Likelihood keeps rising as ‖θ‖ → ∞ along the separating direction, so no finite optimum exists; add L2 or stop early"],
}
