import requests
import json
import math

class RateMyProfScraper:
        def __init__(self, schoolid, first_name, last_name):
            self.schoolid = schoolid
            self.professor_link = ""
            self.info = self.info_scraper(first_name, last_name)

        def info_scraper(self, first_name, last_name):
            num_of_prof = self.get_num_of_profs(self.schoolid)
            num_of_pages = math.ceil(num_of_prof / 20)
            i = 1
            while (i <= num_of_pages): # the loop insert all professor into list
            
                page = requests.get("http://www.ratemyprofessors.com/filter/professor/?&page=" +
                str(i) +
                "&filter=teacherlastname_sort_s+asc&query=*%3A*&queryoption=TEACHER&queryBy=schoolId&sid=" +
                str(self.schoolid))
                prof_list = json.loads(page.content)["professors"]
                l = prof_list[len(prof_list)-1]["tLname"]
                if min(l, last_name) == last_name:
                    for prof in prof_list:
                        if prof["tFname"] == first_name and prof["tLname"] == last_name:
                            info = {
                                "rating" : prof["overall_rating"],
                                "num_ratings" : prof["tNumRatings"],
                                "dept" : prof["tDept"]
                            }
                            self.professor_link = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + str(prof["tid"])
                            return info
                i += 1
                
            return {"rating": "N/A", "num_ratings": "N/A", "dept": "N/A"}

        def info_scraper_bin_search(self, first_name, last_name):
            num_of_prof = self.get_num_of_profs(self.schoolid)
            num_of_pages = math.ceil(num_of_prof / 20)
            i = 1
            while (i <= num_of_pages): # the loop insert all professor into list
            
                page = requests.get("http://www.ratemyprofessors.com/filter/professor/?&page=" +
                str(i) +
                "&filter=teacherlastname_sort_s+asc&query=*%3A*&queryoption=TEACHER&queryBy=schoolId&sid=" +
                str(self.schoolid))
                prof_list = json.loads(page.content)["professors"]
                l = prof_list[len(prof_list)-1]["tLname"]
                if min(l, last_name) == last_name:
                    for prof in prof_list:
                        if prof["tFname"] == first_name and prof["tLname"] == last_name:
                            info = {}
                            info["rating"] = prof["overall_rating"]
                            info["num_ratings"] = prof["tNumRatings"]
                            info["dept"] = prof["tDept"]
                            self.professor_link = "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + str(prof["tid"])
                            return info
                i += 1
                
            return {}

        def get_num_of_profs(self,id):  # function returns the number of professors in the university of the given ID.
            page = requests.get(
                "http://www.ratemyprofessors.com/filter/professor/?&page=1&filter=teacherlastname_sort_s+asc&query=*%3A*&queryoption=TEACHER&queryBy=schoolId&sid=" +
                str(id)
            )
            temp_jsonpage = json.loads(page.content)
            num_of_prof = temp_jsonpage["remaining"] + 20
            return num_of_prof
