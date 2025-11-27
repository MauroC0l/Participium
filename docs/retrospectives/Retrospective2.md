RETROSPECTIVE SPRINT 2 PARTICIPIUM (Team 10)
=====================================

The retrospective includes the following sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed: 5 vs. done: 5 
- Total points committed: 18 vs. done: 18 
- Nr of hours planned: 98h 30m vs. spent: 101h 40m

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Integration Tests passing
- End-to-End tests performed
- Code review completed
- Code present on VCS

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| 0      |   8     |   -    |  25h 45m   |   33h 15m    |
| 4      |   5     |   5    |  9h 30m    |    8h 10m    |
| 5      |   11    |   2    |  20h       |   18h 50m    |
| 6      |   11    |   2    |  19h 30m   |   19h 40m    |
| 7      |   9     |   8    |  13h 30m   |   12h 15m    |
| 8      |   8     |   1    |  10h 15m   |    9h 30m    |

> Story 0 (`Uncategorized`) is for technical tasks, story points are left out (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

  |            | Mean  | StDev |
  |------------|-------|-------|
  | Estimation | 1.8942  | 2.4119  | 
  | Actual     | 1.9356  | 3.2059  |

The formulas used are:

$$\text{Mean }(\mu)=\frac{1}{n}\sum_{i=1}^n x_i$$

$$\text{Sample standard deviation }(s)=\sqrt{\frac{1}{n-1}\sum_{i=1}^n (x_i-\mu)^2}$$

- Total estimation error ratio:

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.0219 $$
    
- Absolute relative task estimation error:

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| = 0.0889 $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated               4h 45m
  - Total hours spent                   4h 45m
  - Nr of automated unit test cases     321     
- Integration testing:
  - Total hours estimated               3h 45m
  - Total hours spent                   3h 45m
  - Nr of test cases                    301       
- E2E testing:
  - Total hours estimated               3h 45m
  - Total hours spent                   3h 45m
  - Nr of test cases                    122

Total coverage: 90.38% 
Total number of tests: 744

- Code review 
  - Total hours estimated               15h
  - Total hours spent                   10h 10m
