const patient_journey_schema = 
`
###

Node Labels and Properties

Encounter : [date:DateTime, baseCost:Double, code:String, claimCost:Double, patientAge:Long, description:String, end:DateTime, coveredAmount:Double, id:String, class:String, isEnd:Boolean]
Patient:	[firstName:String, lastName:String, marital:String, ethnicity:String, race:String, gender:String, city:String, deathDate:String, id:String, birthDate:DateTime, SSN:String]
Provider:	[name:String, speciality:String, id:String]
Payer:	[zip:String, name:String, state:String, address:String, id:String, city:String]
Organization:	[name:String, id:String]
Drug:	[description:String, code:String]
Condition:	[description:String, code:String, num:Long]
CarePlan:	[description:String, code:String]
Allergy:	[description:String, code:String]
Address:	[location:Point, address:String]
Procedure:	[description:String, code:String]
Observation:	[6299-2:Double, 9279-1:Double, 6298-4:Double, 20565-8:Double, 29463-7:Double, 72514-3:Double, 1920-8:Double, 72166-2:String, 1751-7:Double, 4548-4:Double, 8867-4:Double, 8302-2:Double, 8462-4:Double, 10834-0:Double, 8480-6:Double, 49765-1:Double, 2571-8:Double, 2947-0:Double, 2885-2:Double, 18262-6:Double, 6768-6:Double, 2093-3:Double, 59576-9:Double, 1742-6:Double, 1975-2:Double, 2339-0:Double, 38483-4:Double, 2069-3:Double, 2085-9:Double, 14959-1:Double, 39156-5:Double, 33914-3:Double]

Accepted graph traversal paths

(:Condition)-[:LEADS_TO]->(:Condition)
(:Encounter)-[:HAS_ALLERGY]->(:Allergy)
(:Encounter)-[:HAS_CARE_PLAN]->(:CarePlan)
(:Encounter)-[:HAS_CONDITION]->(:Condition)
(:Encounter)-[:HAS_DRUG]->(:Drug)
(:Encounter)-[:HAS_OBSERVATION]->():Observation
(:Encounter)-[:HAS_PAYER]->(:Payer)
(:Encounter)-[:HAS_PROCEDURE]->(:Procedure)
(:Encounter)-[:HAS_PROVIDER]->(Provider)
(:Encounter)-[:NEXT]->(:Encounter)
(:Organization)-[:HAS_ADDRESS]->(:Address)
(:Patient)-[:HAS_ADDRESS]->(:Address)
(:Patient)-[:HAS_ENCOUNTER]->(:Encounter)
(:Patient)-[:HAS_ENCOUNTER]->(:Encounter)-[:HAS_DRUG]->(:Drug)
(:Patient)-[:HAS_ENCOUNTER]->(:Encounter)-[:HAS_PROCEDURE]->(:Procedure)
(:Patient)-[:HAS_ENCOUNTER]->(:Encounter)-[:HAS_CONDITION]->(:Condition)
(:Patient)-[:INSURANCE_END]->(:Payer)
(:Patient)-[:INSURANCE_START]->(:Payer)
(:Provider)-[:BELONGS_TO]->(:Organization)
(:Provider)-[:HAS_ADDRESS]->(:Address)

###
`
export { patient_journey_schema }