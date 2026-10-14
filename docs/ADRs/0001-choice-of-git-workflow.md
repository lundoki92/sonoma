# ADR 0001 - [Choice of git workflow]
**Statut:** ACCEPTED
**Date:** 13/10/2026

## CONTEXT 
We are a team of four working on some features simultaneously. 

## DECISION
Since nothing is in production yet, we are delivering continuously on the main branch so we won't have to patch an existing version in parallel. Therefore we do not need a production branch. 

## CONSEQUENCES
The main risk is that we might forget to update our branches before opening a PR. We will need to keep the MAIN branch up to date. We will not work directly on the MAIN branch. We will pull a new branch for every new features. 
The risk is to have the MAIN branch impacted because there isn't any buffer branch. 