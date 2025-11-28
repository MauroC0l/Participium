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

## ASSESSMENT

- What went wrong in the sprint?
  - We underestimated Sprint Planning and Feature implementation while we overestimated Code Reviews.
  - We spent more hours on Story 5, which has 2 Story Points, while for Story 4, which has more Story Points (5), we spent fewer hours.
  - We were in a rush to finish in the last days.

- What caused your errors in estimation (if any)?
  - Since we had several internal role changes between back-end and front-end, we had to think more carefully about the tasks and how to assign them.
  
- What lessons did you learn (both positive and negative) in this sprint?
  - We can do more than three tasks per Sprint, so we will keep this pace.
  - We learned that we need to be more punctual with our assigned tasks.

- Which improvement goals set in the previous retrospective were you able to achieve?
  - Improve Sprint Planning and enhance task parallelization: in this Sprint our tasks were less overlapped than in the previous Sprint.
  - Enhance team coordination: we still had some issues in coordinating tasks and sharing information, but we definitely improved.
  - Do more Stories: we were able to finish 5 Stories in this Sprint and made progress compared to the last Sprint, where we only did 3 Stories.

- Which ones were you not able to achieve? Why?
  - Finish tasks some days before the deadline: the aim was to complete all tasks 1–2 days before the Sprint end, but we missed this goal because we did not schedule our personal tasks correctly (we committed to 5 Stories instead of 3 Stories).

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - To keep improving Sprint Planning: we made some improvements from the previous Sprint, but we still have to work on it. We will dedicate more time to it and try to plan ahead.
  - To be more organized and on time by establishing internal deadlines for the stories.

- One thing you are proud of as a Team!!
  - We doubled our velocity in this Sprint; we did something we thought we were not able to do!

  