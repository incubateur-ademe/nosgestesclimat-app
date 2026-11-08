# Nos Gestes Climat

A carbon and water footprint calculator. A user answers questions in a simulation, and the Publicodes model turns the answers into footprints.

## Language

### Footprint evaluation

**Public rule**:
A model rule marked `public: oui`. It is part of the model's stable output contract, so its evaluations are stored.
_Avoid_: exposed rule, output rule

**Rule**:
A stored public rule, identified by its name and metric. Its name is its identity across model versions, so a stored Rule must never be renamed.

**Rule evaluation**:
A Rule's value for one simulation: applicable with a value (0 included), not applicable, or not defined.
_Avoid_: computed result

**Metric**:
What a footprint measures: `carbon` or `water`, which the model calls `carbone` / `eau`.
