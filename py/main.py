# Matt Goggin
# 
# the main handler for this artmkt
# includes bindings for all the URLs
# to their Python class equivalents

# commands to start server and update
# dev_appserver.py /Users/mattgoggin/Desktop/CS/bnterprofiler
# appcfg.py update /Users/mattgoggin/Desktop/CS/bnterprofiler

import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
import logging

# /_ah/warmup
# simply here to suppress 404's on our dashboard from GAE using this URL
class WarmupHandler(webapp.RequestHandler):
    def get(self):
        logging.info('Warmup Request') 

class Main(webapp.RequestHandler):
   def get(self):
      template_values = {}
      temp = os.path.join('..', 'html',  'index.html')
      path = os.path.join(os.path.dirname(__file__), temp)
      self.response.out.write(template.render(path, template_values))   
  
application = webapp.WSGIApplication(
                                    [
                                     ('/', Main),
                                    ], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()

