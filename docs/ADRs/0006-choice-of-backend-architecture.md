# ADR 0006 - [Choice of backend architecture]
**Statut:** ACCEPTED 
**Date:** 20/10/2026

## CONTEXT 
We need to chose a structure for our backend architecture. 

## DECISION
We are not chosing the architecture "by Features" because our features are cross-screens: that means that one feature is used on multiple screens of the app. 
MVC is not mandatory with Express so we are not choosing this architecture.
Learning a new architecture would be very time-consumming therefore we are choosing the Layers architecture (en couches) Plus, it is better for our project to do so. 

This architecture will be the following:

routes/ 
 associated URL to a method (URL only here)

controllers/
 read + req, call the service and construct res (error handling)

services/ 
 applies chosen rules, without access to res or req (business rule)

models/ 
 read and write in the database


## CONSEQUENCES
We will need to be careful about the import and export of the said routes. 
Do not forgot to write the logic and cut into the correspondant files. 
We need to change the current architecture starting today, 20th of October 2026.