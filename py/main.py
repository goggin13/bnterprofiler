# Matt Goggin
# 
# the controller for the BnterProfiler App.
# Presents the two static pages, and also the simple 
# wrapper API needed to support JSONP

# commands to start server and update
# dev_appserver.py /Users/mattgoggin/Desktop/CS/bnterprofiler
# appcfg.py update /Users/mattgoggin/Desktop/CS/bnterprofiler
# java -jar yuicompressor-2.4.2.jar -o bnterprofiler.min.js  bnterprofiler.js 

import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
from google.appengine.api import memcache
from django.utils import simplejson as json

# This class wraps the actual Bnter API in order to provide support for
# JSONP requests.
# responds to requests of the form 
# /bnter?user_screen_name=USERNAME
class APIWrapper(webapp.RequestHandler):
   def get(self):
       username = self.request.get('user_screen_name')
       callback = self.request.get('callback')
       url = 'http://bnter.com/api/v1/user/conversations.json?&user_screen_name=' + username

       if not username:
          self.response.out.write('required username and callback')
          return
    
       JSON = memcache.get(url)
       if JSON:
           JSON = '%s(%s)' % (callback, JSON)
           logging.info(callback)
           self.response.out.write(JSON)
           return
        
       result = urlfetch.fetch(url)
       if result.status_code == 200:
           JSON = '%s(%s)' % (callback, result.content)
           memcache.set(url, result.content, 60 * 30)
           logging.info(callback)
           self.response.out.write(JSON)

# These two classes simply write out the static HTML
# for the two pages, using the helper WriteTemplate
def WriteTemplate(page, html, include_js):
    template_values = {'include_js':include_js}
    temp = os.path.join('..', 'html',  html)
    path = os.path.join(os.path.dirname(__file__), temp)
    page.response.out.write(template.render(path, template_values))     

class WTF(webapp.RequestHandler):
   def get(self):
      WriteTemplate(self, 'wtf.html', False)

class Main(webapp.RequestHandler):
   def get(self):
      WriteTemplate(self, 'index.html', True)  

# /_ah/warmup
# simply here to suppress 404's on our dashboard from GAE hitting this URL
class WarmupHandler(webapp.RequestHandler):
    def get(self):
        logging.info('Warmup Request') 

 
application = webapp.WSGIApplication(
                                    [
                                     ('/', Main),
                                     ('/wtf', WTF),
                                     ('/bnter', APIWrapper)
                                    ], debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()

