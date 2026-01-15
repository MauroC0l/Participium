# Participium - Default Users

This document lists all pre-populated users in the database (from `seed.sql` v5.0).

> **SECURITY WARNING**: These are default credentials for development/testing purposes only.

---

## Quick Reference

| Username     | Password   | Role(s)                            | Department/Company |
| ------------ | ---------- | ---------------------------------- | ------------------ |
| `admin`      | `admin`    | Administrator                      | Organization       |
| `officer`    | `officer`  | Municipal Public Relations Officer | Organization       |
| `multirole`  | `password` | Water Network + Electrical         | Multi-Department   |
| `director_*` | `director` | Department Director                | Various            |
| `staff_*`    | `staff`    | Technical Staff                    | Various            |
| `staff2_*`    | `staff`    | Technical Staff                    | Various            |
| `enelx`      | `password` | External Maintainer                | Enel X             |
| `acea`       | `password` | External Maintainer                | Acea               |
| `hera`       | `password` | External Maintainer                | Hera               |
| `atm`        | `password` | External Maintainer                | ATM                |
| `user`       | `password` | Citizen                            | Organization       |
| `user2`      | `password` | Citizen                            | Organization       |

---

## System Administrator

| Field      | Value                   |
| ---------- | ----------------------- |
| Username   | `admin`                 |
| Password   | `admin`                 |
| Email      | admin@participium.local |
| Role       | Administrator           |
| Department | Organization            |

---

## Multi-Role User (PT10 Demo)

This user demonstrates the new multi-role functionality.

| Field       | Value                                               |
| ----------- | --------------------------------------------------- |
| Username    | `multirole`                                         |
| Password    | `password`                                          |
| Email       | multirole@participium.local                         |
| Roles       | Water Network staff member, Electrical staff member |
| Departments | Water and Sewer Services, Public Lighting           |

---


## Municipal Public Relations Officers

**Default Password**: `officer`

| Username      | Email                     | Role                               | Department     |
| ------------- | ------------------------- | ----------------------------------- | -------------- |
| `officer`     | officer@participium.local | Municipal Public Relations Officer  | Organization   |
| `officer2`    | officer2@participium.local| Municipal Public Relations Officer  | Organization   |
| `officer3`    | officer3@participium.local| Municipal Public Relations Officer  | Organization   |

---

## Department Directors

**Default Password**: `director`

| Username            | Email                               | Department                              |
| ------------------- | ----------------------------------- | --------------------------------------- |
| `director_water`    | director.water@participium.local    | Water and Sewer Services                |
| `director_infra`    | director.infra@participium.local    | Public Infrastructure and Accessibility |
| `director_lighting` | director.lighting@participium.local | Public Lighting                         |
| `director_waste`    | director.waste@participium.local    | Waste Management                        |
| `director_traffic`  | director.traffic@participium.local  | Mobility and Traffic Management         |
| `director_parks`    | director.parks@participium.local    | Parks, Green Areas and Recreation       |
| `director_services` | director.services@participium.local | General Services                        |

---

## Technical Staff Members

**Default Password**: `staff`

| Username           | Email                              | Role                            | Category                      |
| ------------------ | ---------------------------------- | ------------------------------- | ----------------------------- |
| `staff_water`      | staff.water@participium.local      | Water Network staff member      | Water Supply                  |
| `staff2_water`     | staff2.water@participium.local     | Water Network staff member      | Water Supply                  |
| `staff_sewer`      | staff.sewer@participium.local      | Sewer System staff member       | Sewer System                  |
| `staff2_sewer`     | staff2.sewer@participium.local     | Sewer System staff member       | Sewer System                  |
| `staff_access`     | staff.access@participium.local     | Accessibility staff member      | Architectural Barriers        |
| `staff2_access`    | staff2.access@participium.local    | Accessibility staff member      | Architectural Barriers        |
| `staff_road`       | staff.road@participium.local       | Road Maintenance staff member   | Roads and Urban Furnishings   |
| `staff2_road`      | staff2.road@participium.local      | Road Maintenance staff member   | Roads and Urban Furnishings   |
| `staff_lighting`   | staff.lighting@participium.local   | Electrical staff member         | Public Lighting               |
| `staff2_lighting`  | staff2.lighting@participium.local  | Electrical staff member         | Public Lighting               |
| `staff_waste`      | staff.waste@participium.local      | Recycling Program staff member  | Waste                         |
| `staff2_waste`     | staff2.waste@participium.local     | Recycling Program staff member  | Waste                         |
| `staff_traffic`    | staff.traffic@participium.local    | Traffic management staff member | Road Signs and Traffic Lights |
| `staff2_traffic`   | staff2.traffic@participium.local   | Traffic management staff member | Road Signs and Traffic Lights |
| `staff_parks`      | staff.parks@participium.local      | Parks Maintenance staff member  | Public Green Areas            |
| `staff2_parks`     | staff2.parks@participium.local     | Parks Maintenance staff member  | Public Green Areas            |
| `staff_support`    | staff.support@participium.local    | Support Officer                 | Other                         |
| `staff2_support`   | staff2.support@participium.local   | Support Officer                 | Other                         |

---

## External Maintainers

**Default Password**: `password`

| Username             | Email                           | Company                  | Specialization                |
| -------------------- | ------------------------------- | ------------------------ | ----------------------------- |
| `enelx`              | interventions@enelx.com         | Enel X                   | Public Lighting               |
| `luceservice`        | service@luceservice.com         | Luce Service             | Public Lighting               |
| `acea`               | water@acea.it                   | Acea                     | Water Supply                  |
| `acquatecnica`       | info@acquatecnica.it            | Acqua Tecnica            | Water Supply                  |
| `hera`               | waste@hera.it                   | Hera                     | Waste                         |
| `ecoservice`         | raccolta@ecoservice.it          | Eco Service              | Waste                         |
| `atm`                | traffic@atm.it                  | ATM                      | Road Signs and Traffic Lights |
| `segnaletica`        | segni@segnaleticamoderna.it     | Segnaletica Moderna      | Road Signs and Traffic Lights |
| `fognaturepro`       | interventi@fognaturepro.it      | Fognature Pro            | Sewer System                  |
| `idraulicaexpress`   | servizio@idraulicaexpress.it    | Idraulica Express        | Sewer System                  |
| `accessibilita`      | progetti@accessibilitatotale.it | Accessibilità Totale     | Architectural Barriers        |
| `barrierezero`       | contatti@barrierezero.it        | Barriere Zero            | Architectural Barriers        |
| `stradesicure`       | lavori@stradesicure.it          | Strade Sicure            | Roads and Urban Furnishings   |
| `asfaltinord`        | manutenzione@asfaltinord.it     | Asfalti Nord             | Roads and Urban Furnishings   |
| `giardinriverdi`     | verde@giardinriverdi.it         | Giardini Verdi           | Public Green Areas            |
| `parchibelli`        | parchi@parchibelli.it           | Parchi Belli             | Public Green Areas            |
| `servizigenerali`    | info@servizigenerali.it         | Servizi Generali         | Other                         |
| `manutenzioneuniv`   | assistenza@manutenzioneuniversale.it | Manutenzione Universale | Other                         |

---

## Test Citizens

**Default Password**: `password`

| Username | Email          |
| -------- | -------------- |
| `user`   | user@test.com  |
| `user2`  | user2@test.com |

---

## User Count Summary

| Category             | Count  |
| -------------------- | ------ |
| System Administrator | 1      |
| Multi-Role User      | 1      |
| Municipal Officers   | 3      |
| Department Directors | 7      |
| Technical Staff      | 18     |
| External Maintainers | 18     |
| Test Citizens        | 2      |
| **Total**            | **50** |

---

**Database Version**: v5.0 (Multi-Role Support)
