# Graph Report - .  (2026-05-04)

## Corpus Check
- Corpus is ~5,996 words - fits in a single context window. You may not need a graph.

## Summary
- 117 nodes · 97 edges · 11 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Controller & Helpers|Admin Controller & Helpers]]
- [[_COMMUNITY_Product Model|Product Model]]
- [[_COMMUNITY_User Model|User Model]]
- [[_COMMUNITY_Order Model|Order Model]]
- [[_COMMUNITY_Cart Model|Cart Model]]
- [[_COMMUNITY_Category Model|Category Model]]
- [[_COMMUNITY_Auth Controller|Auth Controller]]
- [[_COMMUNITY_Cart Controller|Cart Controller]]
- [[_COMMUNITY_Order Controller|Order Controller]]
- [[_COMMUNITY_Product Controller|Product Controller]]
- [[_COMMUNITY_Home Controller|Home Controller]]

## God Nodes (most connected - your core abstractions)
1. `AdminController` - 15 edges
2. `ProductModel` - 15 edges
3. `UserModel` - 10 edges
4. `OrderModel` - 9 edges
5. `CartModel` - 8 edges
6. `CategoryModel` - 8 edges
7. `AuthController` - 6 edges
8. `CartController` - 5 edges
9. `OrderController` - 5 edges
10. `ProductController` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (23 total, 11 thin omitted)

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Admin Controller & Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Product Model` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._